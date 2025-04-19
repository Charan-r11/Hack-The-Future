// API Response Types
export interface UploadResponse {
  extracted_text: string;
}

export interface AnalysisFlags {
  risks: string[];
  rights: string[];
  responsibilities: string[];
}

export interface AnalysisResponse {
  summary: string;
  flags: AnalysisFlags;
}

export interface ChatResponse {
  response: string;
}

export interface TrustScoreResponse {
  score: number;
  verified: boolean;
  organization: string;
}

// Document State Type
export interface DocumentState {
  file: File | null;
  extractedText: string | null;
  category: string | null;
  analysis: AnalysisResponse | null;
  trustScore: TrustScoreResponse | null;
}

// API Error Type
export interface APIError {
  message: string;
  status?: number;
}

export interface TokenBalanceResponse {
  balance: number;
  access_granted: boolean;
} 