export interface AIProcessingRequest {
  files: File[];
  qrLinks?: string[];
  prompt: string;
  templateId?: string;
  userId?: string;
  anonymousSessionId?: string;
}

export interface AIProcessingResponse {
  extractedData: any[];
  generatedResults: any[];
  success: boolean;
  error?: string;
  creditsUsed?: number;
}

export interface AIProcessingRepository {
  processBusinessCards(request: AIProcessingRequest): Promise<AIProcessingResponse>;
}