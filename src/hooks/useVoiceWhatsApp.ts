'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoiceWhatsAppHook {
  isRecording: boolean;
  isProcessing: boolean;
  recordingTime: number;
  hasRecording: boolean;
  isPlaying: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  replayRecording: () => Promise<void>;
  generateWhatsAppMessage: (contactId: string, contactName: string) => Promise<void>;
}

export const useVoiceWhatsApp = (): VoiceWhatsAppHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 0.1;
          if (newTime >= 20) {
            stopRecording();
            return 20;
          }
          return newTime;
        });
      }, 100);
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve();
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = audioBlob;
        
        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setIsRecording(false);
        setHasRecording(true);
        toast.success('Recording stopped');
        resolve();
      };

      mediaRecorderRef.current.stop();
    });
  };

  const replayRecording = async () => {
    if (!audioBlobRef.current) {
      toast.error('No recording to replay');
      return;
    }

    setIsPlaying(true);
    
    try {
      const audio = new Audio(URL.createObjectURL(audioBlobRef.current));
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audio.src);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audio.src);
        toast.error('Failed to play recording');
      };
      
      await audio.play();
    } catch (error) {
      setIsPlaying(false);
      toast.error('Failed to play recording');
    }
  };

  const generateWhatsAppMessage = async (contactId: string, contactName: string) => {
    if (!audioBlobRef.current) {
      toast.error('No audio recording found');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const arrayBuffer = await audioBlobRef.current.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
      const base64Audio = btoa(binaryString);

      const { data, error } = await supabase.functions.invoke('voice-to-whatsapp', {
        body: {
          audio: base64Audio,
          contactId,
          contactName
        }
      });

      if (error) throw error;

      if (data?.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
        toast.success('WhatsApp message generated!');
      }

      // Clear audio after successful processing
      audioBlobRef.current = null;
      audioChunksRef.current = [];
      setHasRecording(false);
      setRecordingTime(0);
      
    } catch (error) {
      console.error('Error generating WhatsApp message:', error);
      toast.error('Failed to generate WhatsApp message');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    recordingTime,
    hasRecording,
    isPlaying,
    startRecording,
    stopRecording,
    replayRecording,
    generateWhatsAppMessage
  };
};