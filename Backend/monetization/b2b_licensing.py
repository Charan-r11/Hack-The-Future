from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, Dict
import uuid
from datetime import datetime

router = APIRouter()

# Mock organization data (in production, this would be stored in a database)
mock_organizations = {
    "org1": {
        "name": "Healthcare Clinic A",
        "plan": "enterprise",
        "api_key": "org1_api_key",
        "token_balance": 1000,
        "monthly_limit": 1000,
        "usage_this_month": 0
    },
    "org2": {
        "name": "Housing App B",
        "plan": "business",
        "api_key": "org2_api_key",
        "token_balance": 500,
        "monthly_limit": 500,
        "usage_this_month": 0
    }
}

class OrganizationInfo(BaseModel):
    org_id: str
    name: str
    plan: str
    token_balance: int
    monthly_limit: int
    usage_this_month: int

class EmbedResponse(BaseModel):
    org_id: str
    iframe_url: str
    token_cost: int
    timestamp: str

class AnalysisReceipt(BaseModel):
    receipt_id: str
    org_id: str
    document_id: str
    token_cost: int
    timestamp: str
    status: str

@router.get("/organization/{org_id}", response_model=OrganizationInfo)
async def get_organization_info(org_id: str):
    if org_id not in mock_organizations:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    org = mock_organizations[org_id]
    return OrganizationInfo(
        org_id=org_id,
        name=org["name"],
        plan=org["plan"],
        token_balance=org["token_balance"],
        monthly_limit=org["monthly_limit"],
        usage_this_month=org["usage_this_month"]
    )

@router.post("/embed-sdk")
async def get_embed_sdk(api_key: str = Header(...)):
    # Find organization by API key
    org_id = None
    for oid, org in mock_organizations.items():
        if org["api_key"] == api_key:
            org_id = oid
            break
    
    if not org_id:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Generate iframe URL with token
    iframe_token = str(uuid.uuid4())
    iframe_url = f"https://consentiq.com/embed/{iframe_token}"
    
    return EmbedResponse(
        org_id=org_id,
        iframe_url=iframe_url,
        token_cost=5,  # 5 tokens per document analysis
        timestamp=datetime.now().isoformat()
    )

@router.post("/analyze-document")
async def analyze_document(
    document_id: str,
    api_key: str = Header(...)
):
    # Find organization by API key
    org_id = None
    for oid, org in mock_organizations.items():
        if org["api_key"] == api_key:
            org_id = oid
            break
    
    if not org_id:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    org = mock_organizations[org_id]
    
    # Check monthly limit
    if org["usage_this_month"] >= org["monthly_limit"]:
        raise HTTPException(status_code=400, detail="Monthly limit exceeded")
    
    # Check token balance
    token_cost = 5  # 5 tokens per document analysis
    if org["token_balance"] < token_cost:
        raise HTTPException(status_code=400, detail="Insufficient token balance")
    
    # Update usage and balance
    org["usage_this_month"] += 1
    org["token_balance"] -= token_cost
    
    # Generate receipt
    receipt = AnalysisReceipt(
        receipt_id=str(uuid.uuid4()),
        org_id=org_id,
        document_id=document_id,
        token_cost=token_cost,
        timestamp=datetime.now().isoformat(),
        status="completed"
    )
    
    return {
        "receipt": receipt,
        "analysis": "Document analysis results here"
    } 