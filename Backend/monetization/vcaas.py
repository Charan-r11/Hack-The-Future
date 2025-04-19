from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
import uuid
from datetime import datetime
import hashlib
from Backend.services.masumi_client import MasumiClient
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
masumi_client = MasumiClient()

# Mock certificate storage (in production, this would be stored in a database)
mock_certificates = {}

class ConsentCertificate(BaseModel):
    certificate_id: str
    org_id: str
    user_id: str
    document_hash: str
    timestamp: str
    status: str
    verifiable_hash: str

class CertificateStatus(BaseModel):
    certificate_id: str
    status: str
    timestamp: str
    verifiable_hash: str

class ConsentRequest(BaseModel):
    org_id: str
    user_id: str
    document_text: str
    summary_completed: bool
    qa_completed: bool

async def generate_verifiable_hash(data: str) -> str:
    """Generate a blockchain-compatible hash using Masumi"""
    try:
        # First create a SHA-256 hash of the data
        document_hash = hashlib.sha256(data.encode()).hexdigest()
        
        # Then verify with Masumi to get blockchain hash
        result = await masumi_client.verify_document(document_hash)
        return result.get("blockchain_hash", document_hash)
    except Exception as e:
        logger.error(f"Error generating verifiable hash: {str(e)}")
        # Fallback to regular hash if Masumi fails
        return hashlib.sha256(data.encode()).hexdigest()

@router.post("/certify-consent", response_model=ConsentCertificate)
async def certify_consent(request: ConsentRequest):
    # Validate prerequisites
    if not request.summary_completed or not request.qa_completed:
        raise HTTPException(
            status_code=400,
            detail="Both summary and Q&A must be completed before certification"
        )
    
    # Generate certificate ID
    certificate_id = str(uuid.uuid4())
    
    # Generate document hash
    document_hash = hashlib.sha256(request.document_text.encode()).hexdigest()
    
    # Generate verifiable hash using Masumi
    verification_data = f"{certificate_id}:{document_hash}:{request.user_id}"
    verifiable_hash = await generate_verifiable_hash(verification_data)
    
    # Create certificate
    certificate = ConsentCertificate(
        certificate_id=certificate_id,
        org_id=request.org_id,
        user_id=request.user_id,
        document_hash=document_hash,
        timestamp=datetime.now().isoformat(),
        status="active",
        verifiable_hash=verifiable_hash
    )
    
    # Store certificate
    mock_certificates[certificate_id] = certificate
    
    return certificate

@router.get("/certificate/{certificate_id}", response_model=ConsentCertificate)
async def get_certificate(certificate_id: str):
    if certificate_id not in mock_certificates:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return mock_certificates[certificate_id]

@router.post("/revoke/{certificate_id}", response_model=CertificateStatus)
async def revoke_certificate(certificate_id: str):
    if certificate_id not in mock_certificates:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    certificate = mock_certificates[certificate_id]
    certificate.status = "revoked"
    
    # Generate new verifiable hash for revocation
    revocation_data = f"{certificate_id}:revoked:{datetime.now().isoformat()}"
    verifiable_hash = await generate_verifiable_hash(revocation_data)
    
    return CertificateStatus(
        certificate_id=certificate_id,
        status="revoked",
        timestamp=datetime.now().isoformat(),
        verifiable_hash=verifiable_hash
    )

@router.get("/verify/{certificate_id}/{hash}")
async def verify_certificate(certificate_id: str, hash: str):
    if certificate_id not in mock_certificates:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    certificate = mock_certificates[certificate_id]
    
    # Verify the hash matches
    verification_data = f"{certificate_id}:{certificate.document_hash}:{certificate.user_id}"
    expected_hash = await generate_verifiable_hash(verification_data)
    
    is_valid = hash == expected_hash
    
    return {
        "certificate_id": certificate_id,
        "is_valid": is_valid,
        "status": certificate.status,
        "timestamp": certificate.timestamp
    } 