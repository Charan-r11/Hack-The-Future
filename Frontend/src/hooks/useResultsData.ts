import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDocumentStore } from '@/store/documentStore';

interface AnalyzeResponse {
  summary: string;
  flags: {
    risks: string[];
    rights: string[];
    responsibilities: string[];
  };
}

interface TrustResponse {
  score: number;
  verified: boolean;
  organization: string;
}

export const useResultsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trustScore, setTrustScore] = useState<TrustResponse | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const documentStore = useDocumentStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!documentStore.file || !documentStore.category) {
        setError('No document or category available');
        setIsLoading(false);
        return;
      }

      try {
        // Create FormData and append file and category
        const formData = new FormData();
        formData.append('file', documentStore.file);
        formData.append('category', documentStore.category);

        // Call upload endpoint
        const analyzeResponse = await axios.post('http://localhost:8000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Transform the response to match our expected format
        const transformedAnalysis = {
          summary: analyzeResponse.data.summary,
          flags: {
            risks: analyzeResponse.data.flags.risks || [],
            rights: analyzeResponse.data.flags.rights || [],
            responsibilities: analyzeResponse.data.flags.responsibilities || [],
          }
        };
        setAnalysis(transformedAnalysis);

        // Set a default trust score while the trust endpoint is implemented
        setTrustScore({
          score: 87,
          verified: true,
          organization: 'Masumi Verified'
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.detail || 
            err.message || 
            'An error occurred while analyzing the document'
          );
        } else {
          setError('An unexpected error occurred while analyzing the document');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [documentStore.file, documentStore.category]);

  return {
    isLoading,
    error,
    trustScore,
    analysis,
  };
}; 