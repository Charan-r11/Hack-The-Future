import fitz
import openai
from typing import Tuple, List, Dict, Any, Optional
from Backend.models.document import DocumentSummary, TrustScore
import hashlib
import os
from dotenv import load_dotenv
import logging
import tiktoken
from .masumi_client import MasumiClient, MasumiClientError
import traceback
import json
import PyPDF2
from openai import AsyncOpenAI
import time

# Set up logging with rotation
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# File handler with rotation (max 10MB per file, keep 5 backup files)
file_handler = logging.handlers.RotatingFileHandler(
    os.path.join(log_dir, "document_processor.log"),
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
file_handler.setFormatter(
    logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s')
)
logger.addHandler(file_handler)

# Add console handler for development
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(
    logging.Formatter('%(levelname)s - %(message)s')
)
logger.addHandler(console_handler)

class DocumentProcessingError(Exception):
    """Custom exception for document processing errors"""
    def __init__(self, message: str, error_code: str = None, details: Dict = None):
        super().__init__(message)
        self.error_code = error_code
        self.details = details or {}
        self.timestamp = time.time()

class DocumentProcessor:
    def __init__(self):
        load_dotenv()
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise DocumentProcessingError(
                message="OPENAI_API_KEY environment variable is required",
                error_code="ENV_VAR_MISSING",
                details={"variable": "OPENAI_API_KEY"}
            )
        
        try:
            self.client = AsyncOpenAI(api_key=self.openai_api_key)
            self.masumi_client = MasumiClient()
            self.encoding = tiktoken.get_encoding("cl100k_base")
            logger.info("DocumentProcessor initialized successfully")
        except Exception as e:
            raise DocumentProcessingError(
                message=f"Failed to initialize DocumentProcessor: {str(e)}",
                error_code="INIT_ERROR",
                details={"error": str(e)}
            )

    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string"""
        if not text:
            logger.warning("Empty text provided for token counting")
            return 0
            
        try:
            token_count = len(self.encoding.encode(text))
            logger.debug(f"Token count: {token_count} for text length: {len(text)}")
            return token_count
        except Exception as e:
            raise DocumentProcessingError(
                message=f"Failed to count tokens: {str(e)}",
                error_code="TOKEN_COUNT_ERROR",
                details={"text_length": len(text)}
            )

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file"""
        if not pdf_path:
            raise DocumentProcessingError(
                message="PDF path cannot be empty",
                error_code="INVALID_PATH"
            )
            
        start_time = time.time()
        try:
            logger.info(f"Starting PDF text extraction: {pdf_path}")
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                total_pages = len(reader.pages)
                logger.info(f"PDF has {total_pages} pages")
                
                text = ""
                for i, page in enumerate(reader.pages, 1):
                    try:
                        page_text = page.extract_text()
                        text += page_text + "\n"
                        logger.debug(f"Extracted {len(page_text)} characters from page {i}/{total_pages}")
                    except Exception as page_error:
                        logger.error(f"Failed to extract text from page {i}: {str(page_error)}")
                        continue
                
                if not text.strip():
                    raise DocumentProcessingError(
                        message="Extracted empty text from PDF",
                        error_code="EMPTY_PDF",
                        details={"path": pdf_path, "total_pages": total_pages}
                    )
                
                processing_time = time.time() - start_time
                logger.info(f"PDF processing completed in {processing_time:.2f} seconds")
                logger.info(f"Extracted {len(text)} characters from {total_pages} pages")
                return text
                
        except FileNotFoundError as e:
            raise DocumentProcessingError(
                message=f"PDF file not found: {pdf_path}",
                error_code="FILE_NOT_FOUND",
                details={"path": pdf_path}
            )
        except PyPDF2.PdfReadError as e:
            raise DocumentProcessingError(
                message=f"Error reading PDF file: {str(e)}",
                error_code="PDF_READ_ERROR",
                details={"path": pdf_path, "error": str(e)}
            )
        except Exception as e:
            raise DocumentProcessingError(
                message=f"Unexpected error processing PDF: {str(e)}",
                error_code="PDF_PROCESSING_ERROR",
                details={
                    "path": pdf_path,
                    "error": str(e),
                    "processing_time": time.time() - start_time
                }
            )

    def split_text_into_chunks(self, text: str, max_tokens: int = 3000) -> List[str]:
        """Split text into chunks that fit within token limit"""
        try:
            logger.info(f"Splitting text into chunks (max tokens: {max_tokens})")
            chunks = []
            current_chunk = ""
            current_tokens = 0
            
            for paragraph in text.split("\n"):
                paragraph_tokens = self.count_tokens(paragraph)
                
                if paragraph_tokens > max_tokens:
                    logger.warning(f"Found paragraph exceeding max tokens: {paragraph_tokens} tokens")
                    # Split paragraph into sentences
                    sentences = paragraph.split(". ")
                    for sentence in sentences:
                        sentence_tokens = self.count_tokens(sentence)
                        if current_tokens + sentence_tokens <= max_tokens:
                            current_chunk += sentence + ". "
                            current_tokens += sentence_tokens
                        else:
                            if current_chunk:
                                chunks.append(current_chunk.strip())
                            current_chunk = sentence + ". "
                            current_tokens = sentence_tokens
                else:
                    if current_tokens + paragraph_tokens <= max_tokens:
                        current_chunk += paragraph + "\n"
                        current_tokens += paragraph_tokens
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = paragraph + "\n"
                        current_tokens = paragraph_tokens
            
            if current_chunk:
                chunks.append(current_chunk.strip())
            
            logger.info(f"Split text into {len(chunks)} chunks")
            return chunks
        except Exception as e:
            error_msg = f"Error splitting text into chunks: {str(e)}"
            logger.error(error_msg)
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise DocumentProcessingError(error_msg) from e

    async def process_chunk(self, chunk: str) -> Dict[str, Any]:
        """Process a single chunk of text using OpenAI API"""
        try:
            logger.info(f"Processing chunk of {len(chunk)} characters")
            logger.debug(f"Chunk content: {chunk[:200]}...")  # Log first 200 chars
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing legal documents and contracts. Extract key information about rights, responsibilities, and risks."},
                    {"role": "user", "content": f"Analyze this text and provide a JSON response with the following structure: {{'summary': 'brief summary', 'risks': ['list of risks'], 'rights': ['list of rights'], 'responsibilities': ['list of responsibilities']}}\n\nText:\n{chunk}"}
                ],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            logger.info("Successfully processed chunk")
            logger.debug(f"Chunk analysis result: {json.dumps(result, indent=2)}")
            return result
        except json.JSONDecodeError as e:
            error_msg = f"Failed to parse OpenAI API response: {str(e)}"
            logger.error(error_msg)
            logger.error(f"Raw response: {response.choices[0].message.content}")
            raise DocumentProcessingError(error_msg) from e
        except Exception as e:
            error_msg = f"Error processing chunk: {str(e)}"
            logger.error(error_msg)
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise DocumentProcessingError(error_msg) from e

    async def generate_summary(self, text: str) -> Dict[str, Any]:
        """Generate a comprehensive summary of the document"""
        try:
            logger.info("Starting document summary generation")
            chunks = self.split_text_into_chunks(text)
            
            # Process each chunk
            chunk_results = []
            for i, chunk in enumerate(chunks):
                try:
                    logger.info(f"Processing chunk {i+1}/{len(chunks)}")
                    result = await self.process_chunk(chunk)
                    chunk_results.append(result)
                except Exception as e:
                    logger.error(f"Error processing chunk {i+1}: {str(e)}")
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    # Continue with other chunks even if one fails
                    continue
            
            if not chunk_results:
                error_msg = "Failed to process any chunks successfully"
                logger.error(error_msg)
                raise DocumentProcessingError(error_msg)
            
            # Combine results
            combined_summary = ""
            combined_risks = set()
            combined_rights = set()
            combined_responsibilities = set()
            
            for result in chunk_results:
                combined_summary += result.get("summary", "") + " "
                combined_risks.update(result.get("risks", []))
                combined_rights.update(result.get("rights", []))
                combined_responsibilities.update(result.get("responsibilities", []))
            
            final_result = {
                "summary": combined_summary.strip(),
                "risks": list(combined_risks),
                "rights": list(combined_rights),
                "responsibilities": list(combined_responsibilities)
            }
            
            logger.info("Successfully generated document summary")
            logger.debug(f"Final analysis result: {json.dumps(final_result, indent=2)}")
            return final_result
        except Exception as e:
            error_msg = f"Error generating document summary: {str(e)}"
            logger.error(error_msg)
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise DocumentProcessingError(error_msg) from e

    async def get_trust_score(self, document_hash: str, document_text: str) -> Tuple[float, bool]:
        """
        Get trust score for a document
        Returns (trust_score, is_verified)
        """
        try:
            logger.info(f"Getting trust score for document hash: {document_hash}")
            
            # First try to verify
            try:
                result = await self.masumi_client.verify_document(document_hash, document_text)
                trust_score = result.get("trust_score", 0.0)
                is_verified = result.get("is_verified", False)
                logger.info(f"Document verified with trust score: {trust_score}, verified: {is_verified}")
                return trust_score, is_verified
            except MasumiClientError as e:
                # If API is unavailable or not configured, return a default score
                logger.warning(f"Trust score API unavailable: {str(e)}")
                return 0.0, False
        except Exception as e:
            logger.error(f"Error getting trust score: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Return default values instead of raising error
            return 0.0, False

    def calculate_document_hash(self, text: str) -> str:
        try:
            return hashlib.sha256(text.encode()).hexdigest()
        except Exception as e:
            logger.error(f"Error calculating document hash: {str(e)}")
            raise 