import axios, { AxiosError } from 'axios';
import { 
  UploadResponse, 
  AnalysisResponse, 
  ChatResponse, 
  TrustScoreResponse, 
  TokenBalanceResponse,
  APIError 
} from './types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
const handleError = (error: AxiosError): APIError => {
  if (error.response) {
    const responseData = error.response.data as { message?: string };
    return {
      message: responseData.message || 'An error occurred',
      status: error.response.status,
    };
  }
  return {
    message: error.message || 'Network error occurred',
  };
};

// API Client Functions
export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw handleError(error as AxiosError);
  }
};

export const analyzeDocument = async (text: string, category: string): Promise<AnalysisResponse> => {
  try {
    const response = await api.post<AnalysisResponse>('/analyze', {
      text,
      category,
    });
    return response.data;
  } catch (error) {
    console.error('Analysis error:', error);
    throw handleError(error as AxiosError);
  }
};

export const chatWithAI = async (
  category: string,
  message: string,
  documentText: string
): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>('/chat', {
      category,
      message,
      document_text: documentText,
    });
    return response.data;
  } catch (error) {
    console.error('Chat error:', error);
    throw handleError(error as AxiosError);
  }
};

export const getTrustScore = async (docHash: string, wallet: string): Promise<TrustScoreResponse> => {
  try {
    const response = await api.post<TrustScoreResponse>('/trust', {
      doc_hash: docHash,
      wallet,
    });
    return response.data;
  } catch (error) {
    console.error('Trust score error:', error);
    throw handleError(error as AxiosError);
  }
};

export const checkTokenBalance = async (userId: string): Promise<TokenBalanceResponse> => {
  try {
    const response = await api.post<TokenBalanceResponse>('/check-balance', {
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Token balance error:', error);
    throw handleError(error as AxiosError);
  }
}; 