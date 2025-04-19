from typing import Dict
from Backend.models.document import TokenBalance, UserTier

class MonetizationService:
    def __init__(self):
        # In-memory storage for token balances
        # In a real implementation, this would be in a database
        self.token_balances: Dict[str, TokenBalance] = {}
        self.initial_tokens = 10  # Starting token balance for pro users

    def get_token_balance(self, user_id: str) -> TokenBalance:
        if user_id not in self.token_balances:
            self.token_balances[user_id] = TokenBalance(
                tokens_used=0,
                tokens_remaining=self.initial_tokens
            )
        return self.token_balances[user_id]

    def use_tokens(self, user_id: str, amount: int) -> bool:
        balance = self.get_token_balance(user_id)
        if balance.tokens_remaining >= amount:
            balance.tokens_used += amount
            balance.tokens_remaining -= amount
            return True
        return False

    def can_access_feature(self, user_tier: UserTier, feature: str) -> bool:
        if user_tier == UserTier.PRO:
            return True
        
        # Free tier access rules
        free_features = {
            "summary": True,
            "flagging": True,
            "trust_verification": False,
            "chatbot": False
        }
        
        return free_features.get(feature, False) 