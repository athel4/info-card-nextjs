'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, MessageCircle, Loader2, Play, Pause } from 'lucide-react';
import { useVoiceWhatsApp } from '@/hooks/useVoiceWhatsApp';
import { cn } from '@/lib/utils';

interface VoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
}

export const VoiceDialog: React.FC<VoiceDialogProps> = ({
  open,
  onOpenChange,
  contactId,
  contactName
}) => {
  const { isRecording, isProcessing, recordingTime, hasRecording, isPlaying, startRecording, stopRecording, replayRecording, generateWhatsAppMessage } = useVoiceWhatsApp();

  const handleRecordToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleGenerate = async () => {
    await generateWhatsAppMessage(contactId, contactName);
    onOpenChange(false);
  };

  const WaveformBar = ({ height, delay }: { height: number; delay: number }) => (
    <div 
      className="bg-primary rounded-full w-1 transition-all duration-150 ease-in-out"
      style={{ 
        height: `${height}px`,
        animationDelay: `${delay}ms`
      }}
    />
  );

  const progressPercentage = (recordingTime / 20) * 100;
  const timeLeft = Math.max(0, 20 - recordingTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background to-secondary/20 border-primary/20">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Voice Message for {contactName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-8 py-8">
          {/* Recording Button */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-full transition-all duration-300",
              isRecording ? "bg-destructive/20 animate-pulse scale-110" : "bg-primary/10"
            )} />
            <Button
              onClick={handleRecordToggle}
              disabled={isProcessing}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={cn(
                "relative h-24 w-24 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer",
                isRecording ? "scale-105" : "hover:scale-105"
              )}
            >
              {isRecording ? (
                <MicOff className="h-10 w-10" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </Button>
          </div>

          {/* Waveform Visualization */}
          {isRecording && (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-end justify-center space-x-1 h-16">
                {Array.from({ length: 12 }, (_, i) => (
                  <WaveformBar
                    key={i}
                    height={8 + Math.sin((recordingTime * 5 + i) * 0.5) * 20 + Math.random() * 15}
                    delay={i * 50}
                  />
                ))}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full max-w-sm">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{recordingTime.toFixed(1)}s</span>
                  <span>{timeLeft.toFixed(1)}s left</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-destructive h-2 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Replay Button */}
          {hasRecording && !isRecording && (
            <div className="flex flex-col items-center space-y-2">
              <Button
                onClick={replayRecording}
                disabled={isProcessing || isPlaying}
                variant="outline"
                className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary/70 hover:shadow-md cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Replay Recording
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Listen to verify your recording before generating WhatsApp message
              </p>
            </div>
          )}

          {/* Status Text */}
          <div className="text-center min-h-[2rem]">
            {isRecording && (
              <p className="text-sm font-medium text-destructive animate-pulse">
                Recording... Tap to stop or wait for auto-stop at 20s
              </p>
            )}
            {!isRecording && !isProcessing && !hasRecording && (
              <p className="text-sm text-muted-foreground">
                Tap the microphone to start recording your voice message
              </p>
            )}
            {!isRecording && !isProcessing && hasRecording && (
              <p className="text-sm text-primary font-medium">
                Recording ready! You can replay to verify or generate WhatsApp message
              </p>
            )}
            {isProcessing && (
              <p className="text-sm text-primary font-medium">
                Processing your voice message...
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 w-full pt-4">
            <Button
              variant="outline"
              className="flex-1 hover:shadow-md cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={isRecording || isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleGenerate}
              disabled={isRecording || isProcessing || !hasRecording}
              className="flex-1 flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:shadow-md cursor-pointer"
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