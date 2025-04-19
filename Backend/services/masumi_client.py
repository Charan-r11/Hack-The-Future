import aiohttp
import os
from dotenv import load_dotenv
import logging
from typing import Dict, Any, Optional
from logging.handlers import RotatingFileHandler
import json
import traceback
import time
from datetime import datetime

# Set up logging with rotation
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# File handler with rotation (max 10MB per file, keep 5 backup files)
file_handler = RotatingFileHandler(
    os.path.join(log_dir, "masumi_client.log"),
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

class MasumiClientError(Exception):
    """Custom exception for Masumi client errors"""
    def __init__(self, message: str, error_code: str = None, status_code: int = None, details: Dict = None):
        super().__init__(message)
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        self.timestamp = time.time()

class MasumiClient:
    def __init__(self):
        load_dotenv()
        self.api_token = os.getenv("MASUMI_TOKEN")
        self.api_url = os.getenv("MASUMI_API_URL", "https://payment.masumi.network")
        self.network = os.getenv("MASUMI_NETWORK", "preprod")
        self.timeout = aiohttp.ClientTimeout(total=30)  # 30 seconds timeout
        
        if not self.api_token:
            raise MasumiClientError(
                message="MASUMI_TOKEN environment variable is required",
                error_code="ENV_VAR_MISSING",
                details={"variable": "MASUMI_TOKEN"}
            )
        
        logger.info(f"Masumi client initialized with API URL: {self.api_url}, network: {self.network}")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get common headers for API requests"""
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "X-Request-ID": datetime.now().strftime("%Y%m%d%H%M%S%f"),
            "X-Client-Version": "1.0.0"
        }
    
    async def _make_request(self, method: str, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Make an HTTP request to the Masumi API with error handling and logging"""
        start_time = time.time()
        headers = self._get_headers()
        url = f"{self.api_url}/{endpoint}"
        
        try:
            logger.info(f"Making {method} request to {url}")
            logger.debug(f"Request headers: {json.dumps(headers, indent=2)}")
            logger.debug(f"Request payload: {json.dumps(payload, indent=2)}")
            
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.request(method, url, headers=headers, json=payload) as response:
                    response_time = time.time() - start_time
                    logger.info(f"Response received in {response_time:.2f} seconds")
                    
                    response_text = await response.text()
                    logger.debug(f"Response status: {response.status}")
                    logger.debug(f"Response text: {response_text}")
                    
                    if response.status != 200:
                        raise MasumiClientError(
                            message=f"API error response (status {response.status})",
                            error_code="API_ERROR",
                            status_code=response.status,
                            details={
                                "response": response_text,
                                "request_url": url,
                                "response_time": response_time
                            }
                        )
                    
                    try:
                        result = await response.json()
                        logger.debug(f"Parsed response: {json.dumps(result, indent=2)}")
                        return result
                    except json.JSONDecodeError as e:
                        raise MasumiClientError(
                            message="Failed to parse API response",
                            error_code="RESPONSE_PARSE_ERROR",
                            status_code=response.status,
                            details={
                                "error": str(e),
                                "response": response_text,
                                "response_time": response_time
                            }
                        )
                        
        except aiohttp.ClientError as e:
            raise MasumiClientError(
                message=f"Network error: {str(e)}",
                error_code="NETWORK_ERROR",
                details={
                    "error": str(e),
                    "url": url,
                    "elapsed_time": time.time() - start_time
                }
            )
        except Exception as e:
            raise MasumiClientError(
                message=f"Unexpected error: {str(e)}",
                error_code="UNEXPECTED_ERROR",
                details={
                    "error": str(e),
                    "url": url,
                    "elapsed_time": time.time() - start_time
                }
            )

    async def register_document(self, document_hash: str, document_text: str) -> Dict[str, Any]:
        """Register a document with the Masumi API"""
        if not document_hash or not document_text:
            raise MasumiClientError(
                message="Document hash and text are required",
                error_code="INVALID_INPUT",
                details={
                    "has_hash": bool(document_hash),
                    "has_text": bool(document_text)
                }
            )
        
        payload = {
            "document_hash": document_hash,
            "document_text": document_text,
            "network": self.network
        }
        
        return await self._make_request("POST", "register", payload)

    async def verify_document(self, document_hash: str, document_text: str) -> Dict[str, Any]:
        """Verify a document using the Masumi API"""
        if not document_hash or not document_text:
            raise MasumiClientError(
                message="Document hash and text are required",
                error_code="INVALID_INPUT",
                details={
                    "has_hash": bool(document_hash),
                    "has_text": bool(document_text)
                }
            )
        
        payload = {
            "document_hash": document_hash,
            "document_text": document_text
        }
        
        return await self._make_request("POST", "verify", payload)

    async def get_trust_score(self, document_hash: str, document_text: str) -> float:
        """Get trust score for a document"""
        try:
            result = await self.verify_document(document_hash, document_text)
            trust_score = result.get("trust_score")
            
            if trust_score is None:
                logger.warning(
                    "Trust score not found in response",
                    extra={"response": json.dumps(result, indent=2)}
                )
                return 0.0
            
            try:
                score = float(trust_score)
                if not 0 <= score <= 1:
                    logger.warning(f"Trust score {score} outside expected range [0,1]")
                return max(0.0, min(1.0, score))  # Clamp between 0 and 1
            except (ValueError, TypeError) as e:
                logger.error(f"Invalid trust score format: {trust_score}")
                return 0.0
            
        except Exception as e:
            logger.error(f"Error getting trust score: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return 0.0

    async def is_verified(self, document_hash: str, document_text: str) -> bool:
        """Check if a document is verified"""
        try:
            result = await self.verify_document(document_hash, document_text)
            is_verified = result.get("is_verified")
            
            if is_verified is None:
                logger.warning(
                    "Verification status not found in response",
                    extra={"response": json.dumps(result, indent=2)}
                )
                return False
            
            return bool(is_verified)
        except Exception as e:
            logger.error(f"Error checking verification status: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False 