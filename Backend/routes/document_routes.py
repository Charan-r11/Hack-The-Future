from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from backend.models.document import Document
from backend.models.user import User
from backend.services.document_storage import DocumentStorage
from backend.services.document_processor import DocumentProcessor
from backend.utils.logger import logger

document_routes = APIRouter()

# Initialize services
document_processor = DocumentProcessor()
document_storage = DocumentStorage()

@document_routes.post("/verify")
async def verify_document(
    document: Document,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    try:
        logger.info(f"Verifying document: {document.title}")
        
        # Get document text from storage
        document_text = await document_storage.get_document_text(document.id)
        if not document_text:
            raise HTTPException(status_code=404, detail="Document text not found")
        
        # Get trust score
        trust_score = await document_processor.get_trust_score(document.hash, document_text)
        
        # Update document with verification results
        document.trust_score = trust_score.score
        document.is_verified = trust_score.is_verified
        document.verification_source = trust_score.source
        document.verified_at = datetime.utcnow()
        
        # Save updated document
        await document_storage.save_document(document)
        
        # Schedule background verification if needed
        if not document.is_verified:
            background_tasks.add_task(
                document_processor.verify_document_background,
                document.id,
                document.hash,
                document_text
            )
        
        return {
            "message": "Document verification completed",
            "trust_score": trust_score.score,
            "is_verified": trust_score.is_verified,
            "source": trust_score.source
        }
        
    except Exception as e:
        logger.error(f"Error verifying document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 