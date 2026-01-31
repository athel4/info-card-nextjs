
import { ExtractedContact } from '@/types/contacts';
// TODO: Refactor to use proper service injection
// import { container } from '@/infrastructure/di/Container';
import { sanitizeForLog } from './security';

export interface AIGeneratedResult {
  type: 'whatsapp' | 'email' | 'linkedin' | 'crm' | 'custom';
  contactId: string;
  contactName: string;
  title: string;
  content: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface ProcessingResponse {
  extractedData: ExtractedContact[];
  generatedResults: AIGeneratedResult[];
  success: boolean;
  error?: string;
  creditsUsed?: number;
}



// Main function to process business cards with AI
export const processBusinessCardsWithAI = async (
  files: File[],
  prompt: string,
  templateId?: string
): Promise<ProcessingResponse> => {
  try {
    console.log('Starting AI processing for', sanitizeForLog(files.length), 'files with prompt:', sanitizeForLog(prompt));

    if (files.length === 0) {
      throw new Error('No files provided for processing');
    }

    // TODO: Use BusinessCardApplicationService via proper dependency injection
    // const result = await container.businessCardApplicationService.processBusinessCards({
    //   files,
    //   prompt,
    //   templateId
    // });
    
    // Temporary placeholder during refactoring
    return {
      extractedData: [],
      generatedResults: [],
      success: false,
      error: 'Service temporarily disabled during refactoring'
    };

  } catch (error) {
    console.error('Error processing business cards:', sanitizeForLog(error));
    
    return {
      extractedData: [],
      generatedResults: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

