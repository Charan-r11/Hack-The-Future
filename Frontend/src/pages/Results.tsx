import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useDocumentStore } from '@/store/documentStore';
import { ChevronLeft, Eye, EyeOff, Volume2, Languages, AlertTriangle, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResultsData } from '@/hooks/useResultsData';

type Tab = 'risks' | 'rights' | 'responsibilities' | 'full';

const Results = () => {
  const [simplifiedView, setSimplifiedView] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('full');
  const [language, setLanguage] = useState('en');
  const documentStore = useDocumentStore();
  const { isLoading, error, trustScore, analysis } = useResultsData();

  const toggleView = () => setSimplifiedView(!simplifiedView);
  const toggleVoiceReading = () => {
    // TODO: Implement voice reading
  };
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Analysis...</h2>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Analysis Error</h2>
          <p className="text-red-500 mb-4">{error || 'Failed to load analysis'}</p>
          <Link to="/">
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const trustScorePercentage = trustScore?.score ? (2 * Math.PI * 45 * trustScore.score / 100) : 0;
  const trustScoreCircumference = 2 * Math.PI * 45;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background/5 backdrop-blur-sm">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={toggleView}>
              {simplifiedView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" onClick={toggleVoiceReading}>
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" onClick={() => changeLanguage(language === 'en' ? 'es' : 'en')}>
              <Languages className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Document Info */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analysis Results</h1>
              <p className="text-muted-foreground">
                Document: {documentStore.file?.name || 'Document Analysis'}
              </p>
              <p className="mt-4 text-gray-300">
                {analysis.summary}
              </p>
            </div>

            {/* Trust Score */}
            <div className="text-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1a1a1a"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#00ffd5"
                    strokeWidth="10"
                    strokeDasharray={`${trustScorePercentage} ${trustScoreCircumference}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#00ffd5]">{trustScore?.score || 0}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-400">Trust Score</p>
              <p className="text-xs text-gray-500">Document verified via<br />{trustScore?.organization || 'Masumi blockchain API'}</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <Button
                variant={simplifiedView ? "default" : "outline"}
                onClick={() => setSimplifiedView(true)}
                className="bg-[#00ffd5]/10 text-[#00ffd5] hover:bg-[#00ffd5]/20"
              >
                Simplified
              </Button>
              <Button
                variant={!simplifiedView ? "default" : "outline"}
                onClick={() => setSimplifiedView(false)}
                className="bg-black/30 text-gray-300 hover:bg-black/40"
              >
                Detailed
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 p-1 backdrop-blur-sm bg-black/20 rounded-lg">
            <Button
              variant="ghost"
              className={cn(
                "flex-1",
                activeTab === 'risks' && "bg-[#00ffd5]/10 text-[#00ffd5]"
              )}
              onClick={() => setActiveTab('risks')}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Risks
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1",
                activeTab === 'rights' && "bg-[#00ffd5]/10 text-[#00ffd5]"
              )}
              onClick={() => setActiveTab('rights')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Rights
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1",
                activeTab === 'responsibilities' && "bg-[#00ffd5]/10 text-[#00ffd5]"
              )}
              onClick={() => setActiveTab('responsibilities')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Responsibilities
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1",
                activeTab === 'full' && "bg-[#00ffd5]/10 text-[#00ffd5]"
              )}
              onClick={() => setActiveTab('full')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Full Analysis
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'risks' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-[#00ffd5]">Potential Risks</h2>
                <div className="space-y-4">
                  {analysis.flags.risks.map((risk, index) => (
                    <div key={index} className="p-4 backdrop-blur-sm bg-black/30 rounded-lg border border-red-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                        <p className="text-gray-300">{risk}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rights' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-[#00ffd5]">Your Rights</h2>
                <div className="space-y-4">
                  {analysis.flags.rights.map((right, index) => (
                    <div key={index} className="p-4 backdrop-blur-sm bg-black/30 rounded-lg border border-green-500/20">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-green-500 mt-1" />
                        <p className="text-gray-300">{right}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'responsibilities' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-[#00ffd5]">Your Responsibilities</h2>
                <div className="space-y-4">
                  {analysis.flags.responsibilities.map((responsibility, index) => (
                    <div key={index} className="p-4 backdrop-blur-sm bg-black/30 rounded-lg border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-500 mt-1" />
                        <p className="text-gray-300">{responsibility}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'full' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-[#00ffd5]">Full Document Analysis</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-red-400">Risks</h3>
                    <div className="space-y-2">
                      {analysis.flags.risks.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                          <p className="text-gray-300">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-green-400">Rights</h3>
                    <div className="space-y-2">
                      {analysis.flags.rights.map((right, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Shield className="w-5 h-5 text-green-500 mt-1" />
                          <p className="text-gray-300">{right}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-400">Responsibilities</h3>
                    <div className="space-y-2">
                      {analysis.flags.responsibilities.map((responsibility, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-blue-500 mt-1" />
                          <p className="text-gray-300">{responsibility}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex justify-between">
            <Button variant="outline" className="bg-black/30 border-white/10">
              Export Report
            </Button>
            <div className="space-x-4">
              <Button variant="outline" className="bg-black/30 border-white/10">
                Upload New Document
              </Button>
              <Button className="bg-[#00ffd5] text-black hover:bg-[#00ffd5]/90">
                Request Human Review
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-gray-400 text-sm py-6">
        <p>Powered by CrewAI, Masumi API, and OpenAI</p>
        <p className="mt-2">© 2025 ConsentIQ. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Results;
