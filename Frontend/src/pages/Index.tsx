import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/FileUploader';
import { CategorySelector } from '@/components/CategorySelector';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useToast } from '@/hooks/use-toast';
import { Zap, Shield, CheckCircle, AlertTriangle, FileText, Lock } from 'lucide-react';
import { uploadDocument, analyzeDocument } from '@/api/client';
import { useDocumentStore } from '@/store/documentStore';

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const documentStore = useDocumentStore();
  
  const categories = [
    "Automobile",
    "Housing",
    "IT",
    "Healthcare",
    "Finance",
    "Legal",
    "Medical",
    "Other"
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleContinue = async () => {
    if (!selectedCategory) {
      toast({
        variant: "destructive",
        title: "Category Required",
        description: "Please select a category for your agreement first."
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files Selected",
        description: "Please upload at least one PDF file to analyze."
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Upload and analyze the document in one step
      const formData = new FormData();
      formData.append('file', uploadedFiles[0]);
      formData.append('category', selectedCategory);
      
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Store results
      documentStore.setFile(uploadedFiles[0]);
      documentStore.setExtractedText(result.extracted_text);
      documentStore.setCategory(selectedCategory);
      documentStore.setAnalysis({
        summary: result.summary,
        flags: result.flags
      });

      toast({
        title: "Analysis Complete",
        description: "Your document has been successfully analyzed."
      });

      navigate('/results');
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen bg-background/5 backdrop-blur-sm p-6">
        <div className="max-w-4xl mx-auto space-y-16 pt-12">
          <div 
            ref={heroRef}
            className="text-center space-y-6"
            style={{
              transform: `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <div className="flex justify-center items-center gap-3 mb-4">
              <Zap size={32} className="text-[#00ffd5]" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-[#00ffd5] to-[#0066ff] bg-clip-text text-transparent">
                ConsentIQ
              </h1>
            </div>
            <p className="text-3xl font-medium text-white/90">
              AI for Legal Transparency
            </p>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We help you understand complex legal and medical documents
              before you sign. Get clear, immediate understanding in seconds.
            </p>
            <div className="pt-4">
              <Link to="/features">
                <Button variant="outline" className="bg-black/30 border-[#00ffd5]/30 text-[#00ffd5] hover:bg-[#00ffd5]/10">
                  View Features
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-16 backdrop-blur-sm bg-black/20 p-8 rounded-3xl border border-white/10">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00ffd5]/10 text-[#00ffd5]">1</span>
                Select the category of your document:
              </h2>
              <CategorySelector
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-medium flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00ffd5]/10 text-[#00ffd5]">2</span>
                Upload your document (PDF only)
              </h2>
              <FileUploader
                onFileUpload={setUploadedFiles}
                uploadedFiles={uploadedFiles}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-medium flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00ffd5]/10 text-[#00ffd5]">3</span>
                Our AI will analyze your document and:
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="backdrop-blur-sm bg-black/30 p-6 rounded-2xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <FileText className="text-[#00ffd5] mt-1" />
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Simplify Complex Language</h3>
                      <p className="text-gray-300">Break down legal jargon into plain, understandable English that anyone can comprehend.</p>
                    </div>
                  </div>
                </div>
                
                <div className="backdrop-blur-sm bg-black/30 p-6 rounded-2xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="text-[#00ffd5] mt-1" />
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Highlight Important Risks</h3>
                      <p className="text-gray-300">Identify and clearly mark any potential risks or concerning clauses you should be aware of.</p>
                    </div>
                  </div>
                </div>
                
                <div className="backdrop-blur-sm bg-black/30 p-6 rounded-2xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <Lock className="text-[#00ffd5] mt-1" />
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Clarify Your Responsibilities</h3>
                      <p className="text-gray-300">Outline what actions and obligations you're committing to by signing the document.</p>
                    </div>
                  </div>
                </div>
                
                <div className="backdrop-blur-sm bg-black/30 p-6 rounded-2xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-[#00ffd5] mt-1" />
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Identify Your Rights</h3>
                      <p className="text-gray-300">Explain the benefits and protections the agreement provides to you as a signatory.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#00ffd5]/10 border border-[#00ffd5]/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="text-[#00ffd5]" />
                  <p className="text-gray-300">
                    <span className="text-[#00ffd5] font-medium">100% Secure & Free:</span> Your documents are processed with bank-level encryption and never stored. ConsentIQ is completely free to use.
                  </p>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <Button 
                  onClick={handleContinue}
                  className="w-44 h-14 text-lg bg-gradient-to-r from-[#00ffd5] to-[#0066ff] hover:opacity-90 transition-opacity relative overflow-hidden group"
                  disabled={!selectedCategory || uploadedFiles.length === 0 || isLoading}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? "Analyzing..." : "Analyze Now"}
                    <Zap size={18} className="animate-pulse" />
                  </span>
                  <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm mt-12">
            <p>Powered by CrewAI, Masumi API, and OpenAI</p>
            <p className="mt-2">© 2025 ConsentIQ. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
