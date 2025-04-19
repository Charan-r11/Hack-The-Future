from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class UserTier(str, Enum):
    FREE = "free"
    PRO = "pro"

class DocumentSummary(BaseModel):
    summary: str
    risks: List[str]
    rights: List[str]
    responsibilities: List[str]

class TrustScore(BaseModel):
    score: float
    is_verified: bool
    source: str

class TokenBalance(BaseModel):
    tokens_used: int
    tokens_remaining: int

class DocumentAnalysis(BaseModel):
    content: str
    summary: Optional[DocumentSummary] = None
    trust_score: Optional[TrustScore] = None
    user_tier: UserTier 