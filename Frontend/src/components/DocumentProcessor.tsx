import React, { useState } from 'react';
import { useAPI } from '../api/hooks';
import { uploadDocument, analyzeDocument, chatWithAI, getTrustScore, checkTokenBalance } from '../api/client';
import { FileUploader } from './FileUploader';
import { CategorySelector } from './CategorySelector';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  'Automobile',
  'Housing',
  'IT',
  'Legal',
  'Healthcare',
  'Finance',
  'Education'
];

export const DocumentProcessor: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [userId] = useState('user-123'); // In a real app, this would come from auth

  // API hooks
  const upload = useAPI(uploadDocument);
  const analyze = useAPI(analyzeDocument);
  const chat = useAPI(chatWithAI);
  const trust = useAPI(getTrustScore);
  const balance = useAPI(checkTokenBalance);

  // Handle file upload
  const handleFileUpload = async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      await upload.execute(newFiles[0]);
      if (upload.data?.extracted_text && selectedCategory) {
        await analyze.execute(upload.data.extracted_text, selectedCategory);
      }
    }
  };

  // Handle category selection
  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    if (upload.data?.extracted_text) {
      await analyze.execute(upload.data.extracted_text, category);
    }
  };

  // Handle chat question
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (upload.data?.extracted_text && selectedCategory && userQuestion.trim()) {
      await chat.execute(selectedCategory, userQuestion, upload.data.extracted_text);
      setUserQuestion('');
    }
  };

  // Handle trust check
  const handleTrustCheck = async () => {
    if (upload.data?.extracted_text) {
      const docHash = btoa(upload.data.extracted_text);
      await trust.execute(docHash, 'user-wallet-123');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Token Balance Check */}
      <div className="flex justify-end">
        <button
          onClick={() => balance.execute(userId)}
          className="px-4 py-2 rounded-lg bg-[#00ffd5]/10 text-[#00ffd5] hover:bg-[#00ffd5]/20 transition-colors"
        >
          Check Balance
        </button>
      </div>

      {/* File Upload */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Upload Document</h2>
        <FileUploader 
          onFileUpload={handleFileUpload} 
          uploadedFiles={files} 
        />
      </div>

      {/* Category Selection */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Select Category</h2>
        <CategorySelector
          categories={categories}
          onSelectCategory={handleCategorySelect}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Analysis Results */}
      {analyze.data && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
          <div className="p-6 rounded-2xl backdrop-blur-sm border border-white/10 bg-black/30">
            <h3 className="text-lg font-medium text-[#00ffd5] mb-2">Summary</h3>
            <p className="text-gray-300">{analyze.data.summary}</p>
            
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-[#00ffd5] mb-2">Risks</h3>
                <ul className="space-y-2">
                  {analyze.data.flags.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <AlertCircle size={16} className="text-red-400 mt-1" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#00ffd5] mb-2">Rights</h3>
                <ul className="space-y-2">
                  {analyze.data.flags.rights.map((right, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <FileText size={16} className="text-green-400 mt-1" />
                      {right}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#00ffd5] mb-2">Responsibilities</h3>
                <ul className="space-y-2">
                  {analyze.data.flags.responsibilities.map((responsibility, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <FileText size={16} className="text-blue-400 mt-1" />
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {analyze.data && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Ask Questions</h2>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask a question about the document..."
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[#00ffd5]"
            />
            <button
              type="submit"
              disabled={chat.loading}
              className={cn(
                "px-6 py-3 rounded-lg text-white font-medium transition-colors",
                chat.loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[#00ffd5] hover:bg-[#00ffd5]/90"
              )}
            >
              {chat.loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Processing...
                </span>
              ) : (
                "Ask Question"
              )}
            </button>
          </form>

          {chat.data && (
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-white/10 bg-black/30">
              <p className="text-gray-300">{chat.data.response}</p>
            </div>
          )}
        </div>
      )}

      {/* Trust Score */}
      {analyze.data && balance.data?.access_granted && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Trust Score</h2>
          <button
            onClick={handleTrustCheck}
            className="px-6 py-3 rounded-lg bg-[#00ffd5] text-white font-medium hover:bg-[#00ffd5]/90 transition-colors"
          >
            Check Trust Score
          </button>

          {trust.data && (
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-white/10 bg-black/30">
              <p className="text-gray-300">
                Trust Score: {trust.data.score}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading States */}
      {(upload.loading || analyze.loading || chat.loading || trust.loading) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="animate-spin" size={24} />
            <span>Processing...</span>
          </div>
        </div>
      )}

      {/* Error States */}
      {(upload.error || analyze.error || chat.error || trust.error) && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
          <p>Error: {(upload.error || analyze.error || chat.error || trust.error)?.message}</p>
        </div>
      )}
    </div>
  );
}; 