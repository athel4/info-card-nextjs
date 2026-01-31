
export interface BusinessCardSession {
  id: string;
  userId: string;
  sessionName?: string;
  filesProcessed: number;
  promptUsed?: string;
  templateId?: string;
  extractedData?: any;
  generatedResults?: any;
  creditsConsumed: number;
  processingStatus: string;
  createdAt: Date;
  updatedAt: Date;
}
