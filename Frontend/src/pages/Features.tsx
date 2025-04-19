
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { 
  FileUp, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Pin, 
  Volume2, 
  Languages, 
  ShieldCheck,
  ArrowRight,
  Zap
} from 'lucide-react';

const Features = () => {
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen bg-background/5 backdrop-blur-sm p-6">
        <div className="max-w-4xl mx-auto space-y-16 pt-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#00ffd5] to-[#0066ff] bg-clip-text text-transparent">
              Features
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover how ConsentIQ transforms complex documents into clear, actionable insights
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-8">
            {/* Document Upload Section */}
            <Card className="border-0 backdrop-blur-sm bg-black/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <FileUp className="text-[#00ffd5]" />
                  Document Upload & Input
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Seamlessly upload or paste your legal and medical consent forms
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                  <p className="text-gray-300">
                    Support for multiple document formats including PDF, DOC, and text
                  </p>
                </div>
                <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                  <p className="text-gray-300">
                    Direct text paste functionality for quick analysis
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Section */}
            <Card className="border-0 backdrop-blur-sm bg-black/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <FileText className="text-[#00ffd5]" />
                  AI Clause Extraction & Simplification
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Advanced AI processing for clear, understandable summaries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="text-[#00ffd5]" />
                      <h3 className="text-xl font-medium">Risks</h3>
                    </div>
                    <p className="text-gray-300">
                      Highlights potential risks and concerning clauses
                    </p>
                  </div>
                  <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="text-[#00ffd5]" />
                      <h3 className="text-xl font-medium">Rights</h3>
                    </div>
                    <p className="text-gray-300">
                      Clear outline of your rights and protections
                    </p>
                  </div>
                  <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <Pin className="text-[#00ffd5]" />
                      <h3 className="text-xl font-medium">Responsibilities</h3>
                    </div>
                    <p className="text-gray-300">
                      Detailed breakdown of your obligations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Section */}
            <Card className="border-0 backdrop-blur-sm bg-black/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Volume2 className="text-[#00ffd5]" />
                  Accessibility & Language Support
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Making legal understanding accessible to everyone
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <Volume2 className="text-[#00ffd5]" />
                    <h3 className="text-xl font-medium">Voice Summaries</h3>
                  </div>
                  <p className="text-gray-300">
                    Listen to document summaries with natural text-to-speech
                  </p>
                </div>
                <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <Languages className="text-[#00ffd5]" />
                    <h3 className="text-xl font-medium">Multilingual Support</h3>
                  </div>
                  <p className="text-gray-300">
                    Get summaries in multiple languages for better understanding
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Section */}
            <Card className="border-0 backdrop-blur-sm bg-black/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <ShieldCheck className="text-[#00ffd5]" />
                  Authenticity Verification
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Blockchain-powered document verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-white/10 hover:border-[#00ffd5]/50 transition-all duration-300">
                  <p className="text-gray-300">
                    Masumi's blockchain API provides trust scores to verify document authenticity and integrity
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center space-y-6 py-8">
              <Link to="/">
                <Button 
                  className="w-44 h-14 text-lg bg-gradient-to-r from-[#00ffd5] to-[#0066ff] hover:opacity-90 transition-opacity relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Try it Now
                    <Zap size={18} className="animate-pulse" />
                  </span>
                  <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-400 text-sm mt-12">
            <p>Powered by CrewAI, Masumi API, and OpenAI</p>
            <p className="mt-2">© 2025 ConsentIQ. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Features;
