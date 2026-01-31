
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Mail, 
  Linkedin, 
  Database, 
  Copy, 
  ExternalLink,
  Check,
  Download
} from 'lucide-react';
import { AIGeneratedResult } from '@/utils/openaiService';
import { sanitizeForHTML } from '@/utils/security';

interface GeneratedResultsProps {
  results: AIGeneratedResult[];
}

const GeneratedResults: React.FC<GeneratedResultsProps> = ({ results }) => {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const getIcon = (type: AIGeneratedResult['type']) => {
    switch (type) {
      case 'whatsapp':
        return MessageCircle;
      case 'email':
        return Mail;
      case 'linkedin':
        return Linkedin;
      case 'crm':
        return Database;
      default:
        return Copy;
    }
  };

  const getTypeColor = (type: AIGeneratedResult['type']) => {
    switch (type) {
      case 'whatsapp':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'email':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'linkedin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'crm':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedItems(prev => new Set(prev).add(id));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleExportAll = () => {
    const exportData = results.map(result => ({
      contact: result.contactName,
      type: result.type,
      title: result.title,
      content: result.content,
      actionUrl: result.actionUrl,
      metadata: result.metadata
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-generated-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (results.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">
              No AI-generated results yet. Upload business cards and add instructions to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group results by contact
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.contactId]) {
      acc[result.contactId] = {
        contactName: result.contactName,
        results: []
      };
    }
    acc[result.contactId].results.push(result);
    return acc;
  }, {} as Record<string, { contactName: string; results: AIGeneratedResult[] }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            AI Generated Results
          </h3>
          <p className="text-gray-600 mt-1">
            {Object.keys(groupedResults).length} contacts • {results.length} generated items
          </p>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleExportAll} className="cursor-pointer hover:shadow-md">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Results by Contact */}
      <div className="space-y-6">
        {Object.entries(groupedResults).map(([contactId, { contactName, results: contactResults }]) => (
          <Card key={contactId} className="border-0 shadow-md bg-white/90">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {contactName.charAt(0).toUpperCase()}
                </div>
                {contactName}
                <Badge variant="secondary" className="ml-auto">
                  {contactResults.length} item{contactResults.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactResults.map((result, index) => {
                const Icon = getIcon(result.type);
                const resultId = `${contactId}-${index}`;
                const isCopied = copiedItems.has(resultId);

                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{result.title}</span>
                        <Badge variant="outline" className={getTypeColor(result.type)}>
                          {result.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(result.content, resultId)}
                          className="h-8 cursor-pointer hover:shadow-md"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {sanitizeForHTML(result.content)}
                      </pre>
                    </div>
                    
                    {result.actionUrl && (
                      <div 
                        className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:text-blue-800 hover:underline transition-colors"
                        onClick={() => window.open(result.actionUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="truncate underline">{sanitizeForHTML(result.actionUrl)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GeneratedResults;
