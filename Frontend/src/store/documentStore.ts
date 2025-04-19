import { create } from 'zustand';
import { DocumentState } from '../api/types';

interface DocumentStore extends DocumentState {
  setFile: (file: File | null) => void;
  setExtractedText: (text: string | null) => void;
  setCategory: (category: string | null) => void;
  setAnalysis: (analysis: any | null) => void;
  setTrustScore: (score: any | null) => void;
  reset: () => void;
}

const initialState: DocumentState = {
  file: null,
  extractedText: null,
  category: null,
  analysis: null,
  trustScore: null,
};

export const useDocumentStore = create<DocumentStore>((set) => ({
  ...initialState,
  setFile: (file) => set({ file }),
  setExtractedText: (extractedText) => set({ extractedText }),
  setCategory: (category) => set({ category }),
  setAnalysis: (analysis) => set({ analysis }),
  setTrustScore: (trustScore) => set({ trustScore }),
  reset: () => set(initialState),
})); 