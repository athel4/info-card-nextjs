import { supabase } from '@/integrations/supabase/client';
import { AIProcessingRepository, AIProcessingRequest, AIProcessingResponse } from '../../domain/repositories/AIProcessingRepository';

export class SupabaseAIProcessingRepository implements AIProcessingRepository {
  async processBusinessCards(request: AIProcessingRequest): Promise<AIProcessingResponse> {
    try {
      // Create FormData with files
      const formData = this.createFormData(request.files, request.prompt, request.templateId);

      // Call the Supabase Edge Function with FormData
      const { data, error } = await supabase.functions.invoke('process-business-cards', {
        body: formData
      });

      if (error) {
        throw new Error(`Function call failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from processing function');
      }

      if (!data.success) {
        return {
          extractedData: [],
          generatedResults: [],
          success: false,
          error: data.error || 'Processing failed'
        };
      }

      return {
        extractedData: data.extractedData || [],
        generatedResults: data.generatedResults || [],
        success: true,
        creditsUsed: data.creditsUsed || 0
      };

    } catch (error) {
      return {
        extractedData: [],
        generatedResults: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private createFormData(
    files: File[], 
    prompt: string, 
    templateId?: string, 
    qrLinks?: string[], 
    anonymousSessionId?: string
  ): FormData {
    const formData = new FormData();
    
    // Add each file to FormData
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    
    // Add prompt and metadata
    formData.append('prompt', prompt);
    formData.append('timestamp', Date.now().toString());
    formData.append('fileCount', files.length.toString());
    
    // Add QR links if provided
    if (qrLinks) {
      formData.append('qrLinkCount', qrLinks.length.toString());
      qrLinks.forEach((qrData, index) => {
        formData.append(`qr_${index}`, qrData);
      });
    }

    // Add anonymous session ID if provided
    if (anonymousSessionId) {
      formData.append('anonymousSessionId', anonymousSessionId);
    }
    
    // Add template ID if provided
    if (templateId) {
      formData.append('templateId', templateId);
    }
    
    return formData;
  }
}