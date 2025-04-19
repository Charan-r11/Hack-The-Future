from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

router = APIRouter()

# Mock token balances (in production, this would be stored in a database)
mock_token_balances = {
    "user1": 1000,
    "user2": 500,
    "user3": 200
}

class TokenReceipt(BaseModel):
    receipt_id: str
    user_id: str
    amount: int
    feature: str
    timestamp: str
    status: str

class TokenBalance(BaseModel):
    user_id: str
    balance: int

@router.get("/balance/{user_id}", response_model=TokenBalance)
async def get_token_balance(user_id: str):
    if user_id not in mock_token_balances:
        raise HTTPException(status_code=404, detail="User not found")
    return TokenBalance(user_id=user_id, balance=mock_token_balances[user_id])

@router.post("/deduct/{user_id}/{amount}")
async def deduct_tokens(user_id: str, amount: int, feature: str):
    if user_id not in mock_token_balances:
        raise HTTPException(status_code=404, detail="User not found")
    
    if mock_token_balances[user_id] < amount:
        raise HTTPException(status_code=400, detail="Insufficient token balance")
    
    # Deduct tokens
    mock_token_balances[user_id] -= amount
    
    # Generate receipt
    receipt = TokenReceipt(
        receipt_id=str(uuid.uuid4()),
        user_id=user_id,
        amount=amount,
        feature=feature,
        timestamp=datetime.now().isoformat(),
        status="completed"
    )
    
    return receipt

# Feature-specific endpoints
@router.post("/premium-summary/{user_id}")
async def premium_summary(user_id: str, document_length: int):
    if document_length <= 5:
        raise HTTPException(status_code=400, detail="Document must be longer than 5 pages for premium summary")
    
    # Deduct 10 tokens for premium summary
    receipt = await deduct_tokens(user_id, 10, "premium_summary")
    return {"receipt": receipt, "summary": "Premium summary content here"}

@router.post("/voice-readout/{user_id}")
async def voice_readout(user_id: str):
    # Deduct 5 tokens for voice readout
    receipt = await deduct_tokens(user_id, 5, "voice_readout")
    return {"receipt": receipt, "audio_url": "mock_audio_url"}

@router.post("/legal-review/{user_id}")
async def legal_review(user_id: str):
    # Deduct 20 tokens for legal review
    receipt = await deduct_tokens(user_id, 20, "legal_review")
    return {"receipt": receipt, "review": "Legal expert review content here"} 