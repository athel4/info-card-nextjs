'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, Camera } from 'lucide-react';

interface QRScannerProps {
  isOpen: boolean;
  onQRDetected: (data: string) => void;
  onClose: () => void;
  onFallbackToCamera: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  isOpen,
  onQRDetected,
  onClose,
  onFallbackToCamera,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setError('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    if (!isOpen) return;
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current && isOpen) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        startQRDetection();
      }
    } catch (err) {
      setError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    // Force cleanup video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(true);
    setError('');
  };

  const startQRDetection = () => {
    const detectQR = async () => {
      if (!videoRef.current || !canvasRef.current || !scanning || !isOpen) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.videoWidth === 0) {
        requestAnimationFrame(detectQR);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      try {
        // Try to use BarcodeDetector if available
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code']
          });
          
          const barcodes = await barcodeDetector.detect(canvas);
          if (barcodes.length > 0) {
            setScanning(false);
            onQRDetected(barcodes[0].rawValue);
            return;
          }
        }
      } catch (err) {
        // BarcodeDetector failed, continue scanning
      }

      if (scanning && isOpen) {
        requestAnimationFrame(detectQR);
      }
    };

    // Start detection after a short delay
    setTimeout(detectQR, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-none w-screen h-screen border-0 bg-black flex flex-col">
        <DialogTitle className="sr-only">QR Code Scanner</DialogTitle>
        <div className="flex justify-between items-center p-4 bg-black/80">
          <h3 className="text-white font-medium">Scanning for QR Code...</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 cursor-pointer hover:shadow-md"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* QR Scanner Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-black/80 text-center">
          <p className="text-white text-sm mb-3">
            Position QR code within the frame
          </p>
          <Button
            onClick={onFallbackToCamera}
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30 cursor-pointer hover:shadow-md"
          >
            <Camera className="h-4 w-4 mr-2" />
            Switch to Camera
          </Button>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
