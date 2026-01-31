
import React from 'react';
import { MobileFileUploader } from './MobileFileUploader';

interface FileUploaderProps {
  files: File[];
  qrLinks: string[];
  onFilesChange: (files: File[]) => void;
  onQRLinksChange: (qrLinks: string[]) => void;
  onUpload: () => void;
  isProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = (props) => {
  return <MobileFileUploader {...props} />;
};
