'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Sparkles, Wand2, MessageSquare, Mail, Linkedin, Database, ArrowRight, AlertCircle, Coins, Settings } from 'lucide-react';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useUserTemplates } from '@/hooks/useUserTemplates';
import { useIsMobile } from '@/hooks/use-mobile';
import { Template } from '@/domain/entities/Template';
import { TemplateManager } from '@/presentation/components/templates/TemplateManager';

// Check if running as PWA
const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
  fileCount: number;
  canProcess?: boolean;
  estimatedCost?: number;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onPromptChange,
  selectedTemplate,
  onTemplateChange,
  onProcess,
  isProcessing,
  fileCount,
  canProcess = true,
  estimatedCost = 0
}) => {
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const { templates, isLoading } = useUserTemplates();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const getTemplateIcon = (templateType: string) => {
    switch (templateType) {
      case 'whatsapp_networking':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'email_followup':
        return <Mail className="h-5 w-5 text-blue-600" />;
      case 'linkedin_connect':
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      case 'crm_import':
        return <Database className="h-5 w-5 text-purple-600" />;
      case 'mixed_outreach':
        return <Wand2 className="h-5 w-5 text-orange-600" />;
      default:
        return <Sparkles className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    if (selectedTemplate === templateId) {
      // Deselect if clicking the same template
      onTemplateChange('');
      onPromptChange('');
    } else {
      const template = templates.find(t => t.id === templateId);
      onTemplateChange(templateId);
      // Populate with template's pattern text for user customization
      onPromptChange(template?.patternText || '');
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <>
      {isMobile ? (
        <Drawer open={showTemplateManager} onOpenChange={setShowTemplateManager}>
          <DrawerContent className="max-h-[95vh]">
            <DrawerHeader>
              <DrawerTitle>Manage Templates</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 overflow-y-auto flex-1">
              <TemplateManager />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showTemplateManager} onOpenChange={setShowTemplateManager}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Templates</DialogTitle>
            </DialogHeader>
            <TemplateManager />
          </DialogContent>
        </Dialog>
      )}

      <Card className="w-full">
      {!isPWA() && (
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Choose Your AI Assistant
            </CardTitle>
            {/* {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateManager(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Manage Templates
              </Button>
            )} */}
          </div>
          <p className="text-sm text-gray-600">
            Select a template for quick results or write a custom prompt for personalized output.
          </p>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {/* Templates Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Available Templates</h3>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={() => handleTemplateSelect(template.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Custom Prompt Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              {selectedTemplate ? 'Template Message (Customize as needed)' : 'Custom Instructions'}
            </h3>
            {selectedTemplate && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedTemplateData?.title || 'Template Selected'}
                </Badge>
                {selectedTemplateData?.userId && (
                  <Badge variant="default" className="text-xs">
                    Your Template
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={
              selectedTemplate
                ? "Edit the template message above. You can modify the text and placeholders like {name}, {event_type}, etc."
                : "Describe what you want to do with these business cards... (e.g., 'Generate WhatsApp messages for networking follow-up')"
            }
            className="min-h-[100px] resize-none"
            disabled={isProcessing}
          />
          {selectedTemplate && selectedTemplateData?.requiredPlaceholders && selectedTemplateData.requiredPlaceholders.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Available placeholders: {selectedTemplateData.requiredPlaceholders.map(p => `{${p}}`).join(', ')}
            </p>
          )}
        </div>

        {/* Cost Information and Process Button */}
        <div className="space-y-4">
          {/* Cost Display */}
          {estimatedCost > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Processing Cost
                </span>
              </div>
              <span className="text-sm font-bold text-blue-800">
                {estimatedCost} credits
              </span>
            </div>
          )}

          {/* Process Button */}
          <Button
            onClick={onProcess}
            disabled={isProcessing || !canProcess || fileCount === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 hover:shadow-md cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Processing {fileCount} Cards...
              </>
            ) : !canProcess ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Insufficient Credits
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Process {fileCount} Card{fileCount > 1 ? 's' : ''} with AI
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          {!canProcess && (
            <p className="text-xs text-red-600 text-center">
              {user 
                ? 'You need more credits to process these cards. Please upgrade your plan.'
                : 'Anonymous users can process up to 2 cards. Sign up for higher limits!'
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect }) => {
  const getTemplateIcon = (templateType: string) => {
    switch (templateType) {
      case 'whatsapp_networking':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'email_followup':
        return <Mail className="h-5 w-5 text-blue-600" />;
      case 'linkedin_connect':
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      case 'crm_import':
        return <Database className="h-5 w-5 text-purple-600" />;
      case 'mixed_outreach':
        return <Wand2 className="h-5 w-5 text-orange-600" />;
      default:
        return <Sparkles className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {getTemplateIcon(template.templateType)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {template.title}
            </h4>
            {/* {template.userId && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                Custom
              </Badge>
            )} */}
          </div>
          {/* <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {template.description}
          </p> */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {(template.generationCost)} credits
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default PromptInput;
