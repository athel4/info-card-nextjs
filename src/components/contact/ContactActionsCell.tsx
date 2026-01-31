import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Mail, Phone, MoreHorizontal, Package, ExternalLink, Loader2, Sparkles, Mic } from 'lucide-react';
import PersonafyPreviewModal from '../personafysneakpeak';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { ContactOutreachAction } from '../../domain/entities/ContactOutreachAction';
import { useApplicationServices } from '../../presentation/contexts/ApplicationServiceContext';
import { useAuth } from '../../presentation/contexts/AuthContext';
import { useCredit } from '../../presentation/contexts/CreditContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { sanitizeForHTML, sanitizeForLog } from '../../utils/security';
import { VoiceDialog } from '../voice/VoiceDialog';


interface ContactActionsCellProps {
  contact: BusinessCardContact;
  onRefresh?: () => void;
}

export const ContactActionsCell: React.FC<ContactActionsCellProps> = ({ contact, onRefresh }) => {
  const { user } = useAuth();
  const { canProcess, refreshCredits } = useCredit();
  const { contactService } = useApplicationServices();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [actions, setActions] = useState<ContactOutreachAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<ContactOutreachAction | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPersonafyModalOpen, setIsPersonafyModalOpen] = useState(false);
  const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);

  useEffect(() => {
    loadActions();
  }, [contact.id]);

  // Refresh actions when contact data changes (after table refresh)
  useEffect(() => {
    loadActions();
  }, [contact]);

  const loadActions = async () => {
    try {
      const contactActions = await contactService.getContactActions(contact.id);
      setActions(contactActions);
    } catch (error) {
      console.error('Error loading contact actions:', error);
      // Set empty actions array to prevent UI issues
      setActions([]);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'call': return <Phone className="h-4 w-4 text-gray-600" />;
      default: return <ExternalLink className="h-4 w-4 text-purple-600" />;
    }
  };

  const handleActionClick = (action: ContactOutreachAction) => {
    if (action.type === 'email') {
      // For email actions, check if we have template content
      if (action.content && action.isGenerated) {
        // Check if content is simple enough for mailto (under 2000 chars)
        if (action.content.length < 2000 && action.content.includes('Subject:')) {
          const lines = action.content.split('\n');
          const subjectLine = lines.find(line => line.toLowerCase().startsWith('subject:'));
          const subject = subjectLine ? subjectLine.replace(/^Subject:\s*/i, '').trim() : 'Follow up';
          
          // Get body after subject line
          const subjectIndex = lines.findIndex(line => line.toLowerCase().startsWith('subject:'));
          const body = lines.slice(subjectIndex + 1).join('\n').trim();
          
          const emailUrl = `mailto:${encodeURIComponent(contact.primaryEmail || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(emailUrl, '_blank');
          
        } else {
          // Show dialog for complex templates
          setSelectedAction(action);
          setIsDialogOpen(true);
        }
      } else if (action.actionUrl) {
        
        // Fallback to basic email link
        window.open(action.actionUrl, '_blank');
      }
    } else if (action.actionUrl) {
      window.open(action.actionUrl, '_blank');
    } else if (action.content) {
      setSelectedAction(action);
      setIsDialogOpen(true);
    }
  };

  const generateOutreachPackage = async () => {
    setIsGenerating(true);
    
    // Show loading toast
    toast({
      title: "Generating Outreach Package",
      description: "Please wait while we create your outreach templates..."
    });
    
    try {
      const hardcodedTemplateId = "45ff7f0a-2a36-4166-96f5-67d9661f1057";
      
      // Use default cost during refactoring
      const estimatedCost = 1;
      
      if (!canProcess(estimatedCost)) {
        toast({
          title: "Insufficient Credits",
          description: `Need ${estimatedCost} credits for outreach package generation.`,
          variant: "destructive"
        });
        return;
      }

      // Call Supabase Edge Function directly for outreach generation
      console.log('Calling genCompleteOutreachPackage with:', {
        contactId: contact.id,
        templateId: hardcodedTemplateId,
        userId: user?.id
      });
      
      const response = await supabase.functions.invoke('genCompleteOutreachPackage', {
        body: {
          contactId: contact.id,
          templateId: hardcodedTemplateId,
          estimatedCost: estimatedCost,
          userId: user?.id
        }
      });
      
      console.log('Edge function response:', response);
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate outreach package');
      }
      
      const resul = response.data?.generated || [];
      
      await loadActions();
      await refreshCredits();
      
      // Invalidate and refetch contact queries to refresh the table
      await queryClient.invalidateQueries({ queryKey: ['user-contacts'] });
      onRefresh?.(); // Trigger table refresh
      
      const ok = (resul?.length ?? 0) > 0;
      let dbRetMsg = "All outreach already available";
      let variant = "info";
      if(!response.data?.status){
          dbRetMsg = response.data?.error;
          variant = "destructive";
      }
      toast({
        title: ok ? "Success" : "No action taken",
        description: ok
          ? "All outreach generated successfully!"
          : dbRetMsg,
        variant: ok ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error generating outreach package:', error);
      toast({
        title: "Error",
        description: "Failed to generate outreach package. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Deduplicate actions - prioritize generated templates over basic contact actions
  const deduplicatedActions = actions.reduce((acc, action) => {
    const existingIndex = acc.findIndex(a => a.type === action.type);
    if (existingIndex >= 0) {
      // If we already have this type, keep the generated one
      if (action.isGenerated && !acc[existingIndex].isGenerated) {
        acc[existingIndex] = action;
      }
    } else {
      acc.push(action);
    }
    return acc;
  }, [] as ContactOutreachAction[]);

  const primaryActions = deduplicatedActions.filter(a => ['whatsapp', 'email'].includes(a.type)).slice(0, 2);
  const otherActions = deduplicatedActions.filter(a => !['whatsapp', 'email'].includes(a.type));
  const hasMoreActions = otherActions.length > 0;

  return (
    <>
      <div className="flex items-center gap-1">
        {primaryActions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:shadow-md cursor-pointer"
            onClick={() => handleActionClick(action)}
            title={action.title}
          >
            {getActionIcon(action.type)}  
          </Button>
        ))}
        
        {(hasMoreActions || primaryActions.length < 2) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:shadow-md cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {otherActions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="cursor-pointer"
                >
                  {getActionIcon(action.type)}
                  <span className="ml-2">{action.title}</span>
                </DropdownMenuItem>
               ))}
              {/* <DropdownMenuItem onClick={() => setIsPersonafyModalOpen(true)}>
                <Sparkles className="h-4 w-4" />
                <span className="ml-2">PERSONAFY...</span>
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsVoiceDialogOpen(true);
                }}
                className="flex items-center"
              >
                <Mic className="h-4 w-4" />
                <span className="ml-2">Voice WhatsApp</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={generateOutreachPackage}
                disabled={isGenerating}
                className="cursor-pointer"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {isGenerating ? 'Generating...' : 'Complete Outreach Package'}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAction?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
              {sanitizeForHTML(selectedAction?.content || '')}
            </div>
            <div className="flex gap-2">
              {selectedAction?.type === 'email' && contact.primaryEmail && (
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAction.content || '');
                    const emailUrl = `mailto:${contact.primaryEmail}`;
                    window.open(emailUrl, '_blank');
                  }}
                  className="flex-1 hover:shadow-md cursor-pointer"
                >
                  Copy & Open Email
                </Button>
              )}
              {selectedAction?.actionUrl && (
                <Button
                  onClick={() => window.open(selectedAction.actionUrl, '_blank')}
                  variant="outline"
                  className="flex-1 hover:shadow-md cursor-pointer"
                >
                  Open Link
                </Button>
              )}
              <Button
                onClick={() => navigator.clipboard.writeText(selectedAction?.content || '')}
                variant="outline"
                className="hover:shadow-md cursor-pointer"
              >
                Copy Text
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Voice WhatsApp Dialog */}
      <VoiceDialog
        open={isVoiceDialogOpen}
        onOpenChange={setIsVoiceDialogOpen}
        contactId={contact.id}
        contactName={`${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.company || 'Contact'}
      />

      {/* <PersonafyPreviewModal 
        open={isPersonafyModalOpen} 
        onClose={() => setIsPersonafyModalOpen(false)} 
      /> */}
    </>
  );
};