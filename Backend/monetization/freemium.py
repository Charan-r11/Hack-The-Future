from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

router = APIRouter()

# Mock user tiers (in production, this would be stored in a database)
mock_user_tiers = {
    "user1": "pro",
    "user2": "free",
    "user3": "pro"
}

class UserTier(BaseModel):
    user_id: str
    tier: str
    features: List[str]

class FeatureAccess(BaseModel):
    user_id: str
    feature: str
    access_granted: bool
    reason: Optional[str] = None

def get_tier_features(tier: str) -> List[str]:
    if tier == "pro":
        return [
            "blockchain_verification",
            "claude_chat",
            "accessibility_features",
            "premium_summary",
            "voice_readout",
            "legal_review"
        ]
    else:  # free tier
        return [
            "basic_summary",
            "risk_flags",
            "responsibility_flags"
        ]

@router.get("/tier/{user_id}", response_model=UserTier)
async def get_user_tier(user_id: str):
    if user_id not in mock_user_tiers:
        raise HTTPException(status_code=404, detail="User not found")
    
    tier = mock_user_tiers[user_id]
    features = get_tier_features(tier)
    
    return UserTier(
        user_id=user_id,
        tier=tier,
        features=features
    )

@router.get("/check-access/{user_id}/{feature}", response_model=FeatureAccess)
async def check_feature_access(user_id: str, feature: str):
    if user_id not in mock_user_tiers:
        raise HTTPException(status_code=404, detail="User not found")
    
    tier = mock_user_tiers[user_id]
    available_features = get_tier_features(tier)
    
    access_granted = feature in available_features
    reason = None if access_granted else f"Feature '{feature}' not available in {tier} tier"
    
    return FeatureAccess(
        user_id=user_id,
        feature=feature,
        access_granted=access_granted,
        reason=reason
    )

@router.post("/upgrade/{user_id}")
async def upgrade_to_pro(user_id: str):
    if user_id not in mock_user_tiers:
        raise HTTPException(status_code=404, detail="User not found")
    
    if mock_user_tiers[user_id] == "pro":
        raise HTTPException(status_code=400, detail="User already has pro tier")
    
    mock_user_tiers[user_id] = "pro"
    return {
        "user_id": user_id,
        "new_tier": "pro",
        "features": get_tier_features("pro"),
        "upgrade_date": datetime.now().isoformat()
    } 