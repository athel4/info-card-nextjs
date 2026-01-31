'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mic, MicOff, MessageCircle, Loader2 } from 'lucide-react';
import { useVoiceWhatsApp } from '@/hooks/useVoiceWhatsApp';
import { cn } from '@/lib/utils';

interface VoiceWhatsAppButtonProps {
  contactId: string;
  contactName: string;
  className?: string;
}

export const VoiceWhatsAppButton: React.FC<VoiceWhatsAppButtonProps> = ({
  contactId,
  contactName,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isRecording, isProcessing, startRecording, stopRecording, generateWhatsAppMessage } = useVoiceWhatsApp();

  const handleRecordToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleGenerate = async () => {
    await generateWhatsAppMessage(contactId, contactName);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("flex items-center gap-2 cursor-pointer hover:shadow-md", className)}
        >
          <MessageCircle className="h-4 w-4" />
          Voice WhatsApp
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Voice WhatsApp Message</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          <div className="text-center">
            <p className="text-lg font-medium">{contactName}</p>
            <p className="text-sm text-muted-foreground">
              Record your message to generate a WhatsApp text
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <Button
              onClick={handleRecordToggle}
              disabled={isProcessing}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={cn(
                "h-20 w-20 rounded-full transition-all duration-200 hover:shadow-lg cursor-pointer",
                isRecording && "animate-pulse scale-110"
              )}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>
          
          <div className="text-center">
            {isRecording && (
              <p className="text-sm text-red-500 font-medium animate-pulse">
                Recording... Click to stop
              </p>
            )}
            {!isRecording && !isProcessing && (
              <p className="text-sm text-muted-foreground">
                Click to start recording
              </p>
            )}
          </div>
          
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 hover:shadow-md cursor-pointer"
              onClick={() => setIsOpen(false)}
              disabled={isRecording || isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleGenerate}
              disabled={isRecording || isProcessing}
              className="flex-1 flex items-center gap-2 hover:shadow-md cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Generate WhatsApp
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};