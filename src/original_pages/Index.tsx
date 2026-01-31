
import React, { useState, useCallback } from 'react';
import { FileUploader } from '../components/FileUploader';
import ResultsDisplay from '../components/ResultsDisplay';
import PromptInput from '../components/PromptInput';
import GeneratedResults from '../components/GeneratedResults';
import { UsageLimits } from '../components/UsageLimits';
import { useCredit } from '../presentation/contexts/CreditContext';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../integrations/supabase/client';
import { AIGeneratedResult } from '../utils/openaiService';
import { ExtractedContact } from '@/types/contacts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Brain, Sparkles, Users, Clock, Shield, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress'; 
import { useUserTemplates } from '../hooks/useUserTemplates';
import { useAuth } from '../presentation/contexts/AuthContext';
import { AnonymousLimitModal } from '@/components/AnonymousLimitModal';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnonymousSessionId } from '../utils/anonymousSession';
import { SEOHead } from '@/components/SEOHead';
import { sanitizeForLog } from '@/utils/security';

// Check if running as PWA
const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [qrLinks, setQrLinks] = useState<string[]>([]);
  const [extractedContacts, setExtractedContacts] = useState<ExtractedContact[]>([]);
  const [generatedResults, setGeneratedResults] = useState<AIGeneratedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [hasShownModal, setHasShownModal] = useState(false);
  const [startupCredit, setstartupCredit] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { user } = useAuth();
  const { canProcess, refreshCredits, dailyCredits, creditInfo, getTotalRemainingCredits } = useCredit();
  const { toast } = useToast();
  const { templates, isLoading } = useUserTemplates();

  // Pull-to-refresh handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCredits();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY > 0 && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, Math.min(100, currentY - startY));
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      handleRefresh();
    }
    setPullDistance(0);
    setStartY(0);
  };



  // Set initial load complete
  React.useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setIsInitialLoad(false), 100);
    }
  }, [isLoading]);

  const isAnonymous = !user;
  // Track total credits with useEffect for real-time updates
  React.useEffect(() => {
    const total = getTotalRemainingCredits();
    console.log('Total credits:', sanitizeForLog(total));
    setTotalCredits(total);
  }, [dailyCredits, creditInfo]);
  // Calculate if generation is requested
  const generationRequested = !!(prompt.trim() || selectedTemplate);
  // Calculate estimated cost: N items (files + QR links) + generation cost (if requested)
  const totalItems = files.length + qrLinks.length;
  let estimatedCost = totalItems;
  if(generationRequested){
    const innerTemplate = templates.find(t => t.id === selectedTemplate);
    if(innerTemplate){
      estimatedCost += innerTemplate.generationCost;
    }
  }

  const handleFilesChange = useCallback((newFiles: File[]) => {
    console.log('Files updated:', sanitizeForLog(newFiles.length));
    setFiles(newFiles);
    // Reset previous results when files change
    setExtractedContacts([]);
    setGeneratedResults([]);
    setProgress(0);
    setCurrentStep('');
  }, []);

  const handleQRLinksChange = useCallback((newQRLinks: string[]) => {
    console.log('QR Links updated:', sanitizeForLog(newQRLinks.length));
    setQrLinks(newQRLinks);
    // Reset previous results when QR links change
    setExtractedContacts([]);
    setGeneratedResults([]);
    setProgress(0);
    setCurrentStep('');
  }, []);

  const handlePromptChange = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
  }, []);

  const handleTemplateChange = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
  }, []);

  const handleStartOver = useCallback(() => {
    setFiles([]);
    setQrLinks([]);
    setExtractedContacts([]);
    setGeneratedResults([]);
    setPrompt('');
    setSelectedTemplate('');
    setProgress(0);
    setCurrentStep('');
  }, []);

  const processBusinessCards = async () => {
    if (files.length === 0 && qrLinks.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one business card image or QR code to process.",
        variant: "destructive",
      });
      return;
    }

    // Check anonymous user credit limits before processing
    if (isAnonymous && (totalCredits - estimatedCost) < 5) {
      setShowLimitModal(true);
      return;
    }

    // Check credits before processing
    if (!canProcess(estimatedCost)) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${estimatedCost} credits to process ${totalItems} item${totalItems > 1 ? 's' : ''}${generationRequested ? ' with AI generation' : ''}.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Uploading files...');

    try {
      console.log(`Starting processing: ${sanitizeForLog(files.length)} files, ${sanitizeForLog(qrLinks.length)} QR links, estimated cost: ${sanitizeForLog(estimatedCost)} credits`);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 500);

      setCurrentStep('Processing with AI...');

      // Get anonymous session ID for contact migration
      const anonymousSessionId = getAnonymousSessionId();
      
      const response = await businessCardService.processBusinessCards({
        files,
        qrLinks,
        prompt,
        templateId: selectedTemplate,
        anonymousSessionId
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.success) {
        throw new Error(response.error || 'Failed to process business cards');
      }

      const { extractedData, generatedResults: results, creditsUsed } = response;

      if (!extractedData || extractedData.length === 0) {
        throw new Error('No data extracted');
      }

      console.log(`Processing completed: ${sanitizeForLog(extractedData.length)} contacts extracted, ${sanitizeForLog(results?.length || 0)} results generated, ${sanitizeForLog(creditsUsed)} credits used`);
      console.log('Credits should be deducted in background. Current display will refresh in 3 seconds.');

      setExtractedContacts(extractedData);
      setGeneratedResults(results || []);
      setCurrentStep('Processing complete!');
      
      // Add 3-second delay before refreshing credits to allow server background task to complete
      setTimeout(async () => {
        await refreshCredits();
      }, 3000);
      
      toast({
        title: "Processing Complete!",
        description: `Successfully processed ${extractedData.length} business card${extractedData.length > 1 ? 's' : ''} using ${creditsUsed} credit${creditsUsed > 1 ? 's' : ''}.`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error processing business cards:', sanitizeForLog(errorMessage));
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStep('');
      }, 2000);
    }
  };

  const showResults = extractedContacts.length > 0 || generatedResults.length > 0;
  
  // Modal logic: only fire once when totalCredits < 5
  React.useEffect(() => {
    if (
      isAnonymous &&
      !hasShownModal &&
      totalCredits < 5 &&
      dailyCredits && // ensure credits have loaded
      dailyCredits.dailyLimit > 0 // ensure real data, not initial state
      && startupCredit !=totalCredits
    ) {
      setstartupCredit(totalCredits);
      setShowLimitModal(true);
      setHasShownModal(true);
    }
  }, [totalCredits, dailyCredits, creditInfo]);

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Skeleton */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto mb-8" />
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
          {/* Usage Limits Skeleton */}
          <div className="max-w-4xl mx-auto mb-8">
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          {/* Upload Card Skeleton */}
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
const isBot = /bot|crawler|spider|crawling/i.test(navigator.userAgent);

  return (
    <>
      <SEOHead 
        title={isBot ? "AI Business Card Scanner - Extract Contacts Instantly" : "Spark Connects"}
        description="Transform business cards into digital contacts with AI. Extract information, generate personalized messages, and streamline your networking workflow. Try free now!"
        keywords="AI business card scanner, namecard, name card, CRM , business card reader, contact extraction, OCR business cards, digital networking, business card app"
      />
      <div 
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
        style={{ transform: `translateY(${pullDistance}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <RefreshCw className={`h-5 w-5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg relative">
              <img src="/og-image.png" className='invisible' style={{ maxWidth: "60px", maxHeight: "50px" }} / >
              <img src="/og-image.png" className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' style={{  maxHeight: "80px" }} / >
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Make Every Connection Count
          </h1>
          {!isPWA() && (
            <>
              <p className="md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 text-[1rem]">
                Spark turns business cards into opportunities — <br/>capture, organize, and follow up effortlessly.
              </p>
              
              {/* Feature highlights */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8 hidden md:grid">
                <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                  <span className="font-medium text-gray-700">AI-Powered Extraction</span>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <Users className="h-6 w-6 text-purple-500" />
                  <span className="font-medium text-gray-700">Smart Networking</span>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <Clock className="h-6 w-6 text-green-500" />
                  <span className="font-medium text-gray-700">Instant Results</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Usage Limits */}
        <div className="max-w-4xl mx-auto mb-8">
          <UsageLimits 
            cardCount={totalItems} 
            generationRequested={generationRequested}
            estimatedCost={estimatedCost}
          />
        </div>

        {/* Main Content */}
        {!showResults ? (
          <div className="max-w-4xl mx-auto">
            {/* File Upload Section */}
            <Card className="mb-8 shadow-lg border-0">
              <CardHeader className="text-center pb-6">
                {/* <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <Upload className="h-6 w-6 text-blue-500" />
                  Upload Business Cards
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Select one or more business card images to get started
                </p> */}
              </CardHeader>
              <CardContent>
                <FileUploader 
                  files={files}
                  qrLinks={qrLinks}
                  onFilesChange={handleFilesChange}
                  onQRLinksChange={handleQRLinksChange}
                  onUpload={processBusinessCards}
                  isProcessing={isProcessing}
                />
              </CardContent>
            </Card>

            {/* Prompt Input Section */}
            {(files.length > 0 || qrLinks.length > 0) && (
              <Card className="mb-8 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-purple-500" />
                    What would you like to do?
                  </CardTitle>
                  <p className="text-gray-600">
                    Tell us what you want to do with the business card information
                  </p>
                </CardHeader>
                <CardContent>
                  <PromptInput 
                    prompt={prompt}
                    onPromptChange={handlePromptChange}
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={handleTemplateChange}
                    onProcess={processBusinessCards}
                    isProcessing={isProcessing}
                    fileCount={totalItems}
                    canProcess={canProcess(estimatedCost)}
                    estimatedCost={estimatedCost}
                  />
                </CardContent>
              </Card>
            )}

            {/* Processing Progress */}
            {isProcessing && (
              <Card className="mb-8 shadow-lg border-0">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{currentStep}</span>
                      <span className="text-sm text-gray-500">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-gray-600 text-center">
                      Processing {totalItems} item{totalItems > 1 ? 's' : ''}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Notice */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Shield className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800 text-center md:text-left">
                  <a href="/tnc_with_privacy.pdf" target='_blank'>Term &amp; Condition</a>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Generated Results */}
            {generatedResults.length > 0 && (
              <GeneratedResults 
                results={generatedResults}
              />
            )}
            
            {/* Extracted Data */}
            {extractedContacts.length > 0 && (
              <ResultsDisplay 
                extractedData={extractedContacts}
                generatedResults={generatedResults}
                onStartOver={handleStartOver}
                prompt={prompt}
              />
            )}
          </div>
        )}
        
        
        <AnonymousLimitModal 
          isOpen={showLimitModal} 
          onClose={() => setShowLimitModal(false)} 
        />
      </div>
      </div>
    </>
  );
};

export default Index;
