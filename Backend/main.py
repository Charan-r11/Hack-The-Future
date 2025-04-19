from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from Backend.services.document_processor import DocumentProcessor
from Backend.services.monetization import MonetizationService
from Backend.models.document import DocumentAnalysis, UserTier, TokenBalance, TrustScore
import tempfile
import os
import logging
import traceback

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Document Analysis API")

# Enable CORS with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # Specifically allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600  # Cache preflight requests for 1 hour
)

# Initialize services
try:
    document_processor = DocumentProcessor()
    monetization_service = MonetizationService()
    logger.info("Services initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize services: {str(e)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    raise

@app.get("/")
async def root():
    return {
        "message": "Welcome to Document Analysis API",
        "version": "1.0.0",
        "endpoints": [
            "/upload - Upload and analyze PDF documents",
            "/chat - Chat with document content",
            "/token-balance - Check token balance"
        ]
    }

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    user_tier: UserTier = UserTier.FREE,
    user_id: str = "default"
):
    temp_path = None
    try:
        logger.info(f"Received upload request for file: {file.filename} with category: {category}")
        
        if not file.filename.endswith('.pdf'):
            logger.warning(f"Invalid file type: {file.filename}")
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            try:
                content = await file.read()
                temp_file.write(content)
                temp_path = temp_file.name
                logger.info(f"File saved temporarily at: {temp_path}")
            except Exception as e:
                logger.error(f"Error saving file: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                raise HTTPException(status_code=500, detail="Error saving uploaded file")

        try:
            # Extract text from PDF
            logger.info("Extracting text from PDF...")
            text = document_processor.extract_text_from_pdf(temp_path)
            logger.info("Text extraction successful")
            
            # Generate summary
            logger.info("Generating document summary...")
            summary_result = await document_processor.generate_summary(text)
            logger.info("Summary generation successful")
            
            # Format response for frontend
            response = {
                "extracted_text": text,
                "summary": summary_result["summary"],
                "flags": {
                    "risks": summary_result["risks"],
                    "rights": summary_result["rights"],
                    "responsibilities": summary_result["responsibilities"]
                }
            }
            
            return response

        except Exception as e:
            logger.error(f"Error processing document content: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing document content: {str(e)}"
            )
        finally:
            # Clean up temporary file
            if temp_path:
                try:
                    os.unlink(temp_path)
                    logger.info("Temporary file cleaned up")
                except Exception as e:
                    logger.error(f"Error cleaning up temporary file: {str(e)}")

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error processing document: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while processing your request: {str(e)}"
        )

@app.post("/chat")
async def chat_with_document(
    question: str,
    document_text: str,
    user_tier: UserTier = UserTier.FREE,
    user_id: str = "default"
):
    try:
        if not monetization_service.can_access_feature(user_tier, "chatbot"):
            raise HTTPException(status_code=402, detail="Chat feature requires pro tier")

        if not monetization_service.use_tokens(user_id, 1):  # Cost 1 token
            raise HTTPException(status_code=402, detail="Insufficient tokens")

        # Validate input
        if not question or not document_text:
            raise HTTPException(status_code=400, detail="Question and document text are required")

        # Split document into chunks
        try:
            chunks = document_processor.split_text_into_chunks(document_text)
        except Exception as e:
            logger.error(f"Error splitting document into chunks: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Error processing document content")
        
        # Process each chunk and combine answers
        all_answers = []
        for chunk in chunks:
            try:
                response = document_processor.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant analyzing a document. Answer questions based on the document content. If the information is not in this chunk, say so."},
                        {"role": "user", "content": f"Document chunk: {chunk}\n\nQuestion: {question}"}
                    ]
                )
                answer = response.choices[0].message.content
                if "not in this chunk" not in answer.lower():
                    all_answers.append(answer)
            except Exception as e:
                logger.error(f"Error processing chunk with OpenAI: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                continue  # Skip this chunk and try the next one

        # Combine answers if we have multiple relevant ones
        if not all_answers:
            return {"answer": "I couldn't find relevant information in the document to answer your question."}
        elif len(all_answers) == 1:
            return {"answer": all_answers[0]}
        else:
            try:
                # Ask GPT to combine the answers
                combined_prompt = f"""
                Combine these answers about the same question into one coherent response:
                {chr(10).join(all_answers)}
                """
                response = document_processor.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant combining multiple answers into one coherent response."},
                        {"role": "user", "content": combined_prompt}
                    ]
                )
                return {"answer": response.choices[0].message.content}
            except Exception as e:
                logger.error(f"Error combining answers: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                # If combining fails, return the first answer
                return {"answer": all_answers[0]}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@app.get("/token-balance/{user_id}")
async def get_token_balance(user_id: str):
    try:
        balance = monetization_service.get_token_balance(user_id)
        return TokenBalance(user_id=user_id, balance=balance)
    except Exception as e:
        logger.error(f"Error getting token balance: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting token balance: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 