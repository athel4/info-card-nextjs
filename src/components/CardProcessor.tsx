
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, CheckCircle } from 'lucide-react';
import { ExtractedContact } from '@/types/contacts';
import { extractBusinessCardInfo } from '@/utils/textExtraction';

interface CardProcessorProps {
  files: File[];
  onDataExtracted: (data: ExtractedContact[]) => void;
  onProcessingStart: () => void;
}

const CardProcessor: React.FC<CardProcessorProps> = ({ 
  files, 
  onDataExtracted, 
  onProcessingStart 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [hasStarted, setHasStarted] = useState(false);

  const processFiles = async () => {
    if (files.length === 0) return;
    
    setHasStarted(true);
    onProcessingStart();
    setProgress(0);

    const results: ExtractedContact[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file.name);
      setProgress((i / files.length) * 100);

      try {
        // Create image URL for display
        const imageUrl = URL.createObjectURL(file);
        
        // Extract text from the image
        const extractedText = await extractBusinessCardInfo(file);
        
        // Create result object
        const result: ExtractedContact = {
          id: `card-${i}-${Date.now()}`,
          imageUrl,
          ...extractedText
        };

        results.push(result);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        
        // Add error result
        results.push({
          id: `card-${i}-${Date.now()}`,
          imageUrl: URL.createObjectURL(file),
          name: 'Error processing card',
          company: 'Please try again'
        });
      }
    }

    setProgress(100);
    setCurrentFile('');
    
    // Brief delay before showing results
    setTimeout(() => {
      onDataExtracted(results);
    }, 500);
  };

  useEffect(() => {
    if (files.length > 0 && !hasStarted) {
      processFiles();
    }
  }, [files]);

  if (files.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Processing Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Brain className="h-6 w-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          AI Processing in Progress
        </h3>
        <p className="text-gray-600">
          Analyzing {files.length} business card{files.length > 1 ? 's' : ''} and extracting information...
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Progress
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-3 bg-gray-200" />
      </div>

      {/* Current File */}
      {currentFile && (
        <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="text-blue-700 font-medium">
            Processing: {currentFile}
          </span>
        </div>
      )}

      {/* Completion */}
      {progress === 100 && !currentFile && (
        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700 font-medium">
            Processing Complete!
          </span>
        </div>
      )}

      {/* File Preview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <div key={index} className="relative group">
            <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden border">
              <img
                src={URL.createObjectURL(file)}
                alt={`Business card ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {progress > (index / files.length) * 100 && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 truncate">
              {file.name}
            </p>
          </div>
        ))}
      </div>

      {/* Processing Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{files.length}</div>
          <div className="text-sm text-gray-500">Total Cards</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.floor(progress / (100 / files.length))}
          </div>
          <div className="text-sm text-gray-500">Processed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {progress === 100 ? files.length : 0}
          </div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">AI</div>
          <div className="text-sm text-gray-500">Powered</div>
        </div>
      </div>
    </div>
  );
};

export default CardProcessor;

