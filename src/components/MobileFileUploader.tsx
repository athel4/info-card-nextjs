
'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Camera, Image as ImageIcon, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '../presentation/contexts/AuthContext';
import { useCredit } from '../presentation/contexts/CreditContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ImageCompressionService } from '../application/services/ImageCompressionService';
import { sanitizeForLog } from '../utils/security';
import { QRScanner } from './QRScanner';
import { useToast } from '@/hooks/use-toast';

interface MobileFileUploaderProps {
  files: File[];
  qrLinks: string[];
  onFilesChange: (files: File[]) => void;
  onQRLinksChange: (qrLinks: string[]) => void;
  onUpload: () => void;
  isProcessing: boolean;
}

export const MobileFileUploader: React.FC<MobileFileUploaderProps> = ({
  files,
  qrLinks,
  onFilesChange,
  onQRLinksChange,
  onUpload,
  isProcessing,
}) => {
  const { user } = useAuth();
  const { canProcess, getTotalRemainingCredits, dailyCredits } = useCredit();
  const isMobile = useIsMobile();
  const [dragActive, setDragActive] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getMaxFiles = () => {
    if (user) {
      return 25;
    } else {
      return Math.min(dailyCredits.dailyLimit, dailyCredits.creditsRemaining);
    }
  };

  const maxFiles = getMaxFiles();
  const remainingCredits = getTotalRemainingCredits();
  const totalItems = files.length + (qrLinks?.length || 0);
  const isAtProcessingLimit = !user && dailyCredits.creditsRemaining === 0;
  const wouldExceedLimit = !user && totalItems > dailyCredits.creditsRemaining;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log('Files dropped:', sanitizeForLog(acceptedFiles.length));
      
      try {
        const compressedFiles = await ImageCompressionService.compressFiles(acceptedFiles);
        
        if (!user) {
          const availableSlots = dailyCredits.creditsRemaining;
          if (availableSlots === 0) {
            return;
          }
          
          const totalAfterDrop = files.length + compressedFiles.length;
          if (totalAfterDrop > availableSlots) {
            const filesToAdd = compressedFiles.slice(0, Math.max(0, availableSlots - files.length));
            onFilesChange([...files, ...filesToAdd]);
          } else {
            onFilesChange([...files, ...compressedFiles]);
          }
        } else {
          const totalFiles = files.length + compressedFiles.length;
          
          if (totalFiles > maxFiles) {
            const remainingSlots = maxFiles - files.length;
            const filesToAdd = compressedFiles.slice(0, remainingSlots);
            onFilesChange([...files, ...filesToAdd]);
          } else {
            onFilesChange([...files, ...compressedFiles]);
          }
        }
      } catch (error) {
        console.error('Image compression failed:', sanitizeForLog(error));
        // Fallback to original files if compression fails
        onFilesChange([...files, ...acceptedFiles]);
      }
      
      setDragActive(false);
    },
    [files, onFilesChange, maxFiles, user, dailyCredits.creditsRemaining]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    disabled: isAtProcessingLimit,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const removeQRLink = (index: number) => {
    onQRLinksChange((qrLinks || []).filter((_, i) => i !== index));
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleQRDetected = (qrData: string) => {
    setShowQRScanner(false);
    onQRLinksChange([...(qrLinks || []), qrData]);
    toast({
      title: "QR Code Detected!",
      description: `Data: ${qrData.substring(0, 50)}${qrData.length > 50 ? '...' : ''}`,
    });
  };

  const handleQRScannerClose = () => {
    setShowQRScanner(false);
  };

  const handleFallbackToCamera = () => {
    setShowQRScanner(false);
    // Fallback to regular camera capture
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageProcessing = async (files: File[]) => {
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    await onDrop(files);
  };

  const handleCameraChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      await handleImageProcessing(selectedFiles);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      await handleImageProcessing(selectedFiles);
    }
  };

  const canAddMoreFiles = !isAtProcessingLimit && totalItems < maxFiles;
  const hasReachedLimit = totalItems >= maxFiles || isAtProcessingLimit;

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-4 sm:p-6">
          {canAddMoreFiles ? (
            <div className="text-center space-y-4">
              {/* Desktop/Large Screen Upload Area */}
              <div
                {...getRootProps()}
                className={`hidden sm:block cursor-pointer transition-colors p-8 rounded-lg ${
                  isDragActive || dragActive ? 'bg-blue-50 border-blue-300' : ''
                } ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} disabled={hasReachedLimit} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Business Card Images
                </h3>
                <p className="text-sm text-gray-600">
                  Drag and drop your images here, or click to select files
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {user 
                    ? `You can upload up to ${maxFiles} cards at once` 
                    : `Anonymous users: ${dailyCredits.creditsRemaining} credits remaining today`
                  }
                </p>
                <p className="text-xs text-gray-500">
                  Supports: JPG, PNG, GIF, BMP, WebP
                </p>
              </div>

              {/* Mobile Upload Options */}
              <div className="sm:hidden space-y-3">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">
                  Upload Business Card Images
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {user 
                    ? `You can upload up to ${maxFiles} cards at once` 
                    : `${dailyCredits.creditsRemaining} credits remaining today`
                  }
                </p>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={handleCameraCapture}
                    className="h-14 flex-col gap-1 touch-manipulation active:scale-95 transition-transform hover:shadow-md cursor-pointer"
                    variant="outline"
                    disabled={hasReachedLimit}
                    style={{ minHeight: '56px' }}
                  >
                    <Camera className="h-5 w-5" />
                    <span className="text-xs font-medium">Camera</span>
                  </Button>
                  <Button
                    onClick={handleQRScan}
                    className="h-14 flex-col gap-1 touch-manipulation active:scale-95 transition-transform hover:shadow-md cursor-pointer"
                    variant="outline"
                    disabled={hasReachedLimit}
                    style={{ minHeight: '56px' }}
                  >
                    <QrCode className="h-5 w-5" />
                    <span className="text-xs font-medium">QR Scan<br/><small>(Beta)</small></span>
                  </Button>
                  <Button
                    onClick={handleFileSelect}
                    className="h-14 flex-col gap-1 touch-manipulation active:scale-95 transition-transform hover:shadow-md cursor-pointer"
                    variant="outline"
                    disabled={hasReachedLimit}
                    style={{ minHeight: '56px' }}
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-xs font-medium">Gallery</span>
                  </Button>
                </div>

                {/* Hidden inputs for mobile */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleCameraChange}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isAtProcessingLimit ? 'Daily Limit Reached' : 'Maximum Files Reached'}
              </h3>
              <p className="text-sm text-gray-600">
                {isAtProcessingLimit 
                  ? `You've reached your daily limit of ${dailyCredits.dailyLimit} credits`
                  : user 
                    ? `You've reached the maximum of ${maxFiles} files` 
                    : `You've reached the limit of ${maxFiles} credits`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {(files.length > 0 || (qrLinks?.length || 0) > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                Selected Items ({files.length + (qrLinks?.length || 0)}/{user ? 20 : 5})
              </h4>
              {(hasReachedLimit || wouldExceedLimit) && (
                <div className="flex items-center text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {isAtProcessingLimit ? 'Daily limit reached' : wouldExceedLimit ? 'Exceeds limit' : 'Limit reached'}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`file-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-12 h-12 sm:w-10 sm:h-10 object-cover rounded"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0 hover:shadow-md cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(qrLinks || []).map((qrData, index) => (
                <div
                  key={`qr-${index}`}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-10 sm:h-10 bg-blue-100 rounded flex items-center justify-center">
                        <QrCode className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        QR Link {index + 1}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {qrData.substring(0, 30)}...
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQRLink(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0 hover:shadow-md cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* {(files.length > 0 || (qrLinks?.length || 0) > 0) && (
        <div className="flex justify-center">
          <Button
            onClick={onUpload}
            disabled={isProcessing || (files.length === 0 && (qrLinks?.length || 0) === 0) || wouldExceedLimit}
            className="w-full sm:w-auto px-8 py-2 text-base"
            size={isMobile ? "lg" : "default"}
          >
            {isProcessing ? 'Processing...' : `Process ${files.length + (qrLinks?.length || 0)} Item${(files.length + (qrLinks?.length || 0)) > 1 ? 's' : ''}`}
          </Button>
        </div>
      )} */}
      
      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onQRDetected={handleQRDetected}
        onClose={handleQRScannerClose}
        onFallbackToCamera={handleFallbackToCamera}
      />
    </div>
  );
};
