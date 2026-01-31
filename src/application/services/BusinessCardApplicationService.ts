import { BusinessCardContactRepository } from '../../domain/repositories/BusinessCardContactRepository';
import { BusinessCardSessionRepository } from '../../domain/repositories/BusinessCardSessionRepository';
import { TemplateRepository } from '../../domain/repositories/TemplateRepository';
import { AIProcessingRepository } from '../../domain/repositories/AIProcessingRepository';

export interface ProcessBusinessCardsRequest {
  files: File[];
  qrLinks?: string[];
  prompt: string;
  templateId?: string;
  userId?: string;
  anonymousSessionId?: string;
}

export interface ProcessBusinessCardsResponse {
  extractedData: any[];
  generatedResults: any[];
  success: boolean;
  error?: string;
  creditsUsed?: number;
}

export class BusinessCardApplicationService {
  constructor(
    private businessCardContactRepository: BusinessCardContactRepository,
    private businessCardSessionRepository: BusinessCardSessionRepository,
    private templateRepository: TemplateRepository,
    private aiProcessingRepository: AIProcessingRepository
  ) {}

  async processBusinessCards(request: ProcessBusinessCardsRequest): Promise<ProcessBusinessCardsResponse> {
    try {
      // Validate template if provided
      if (request.templateId) {
        const template = await this.templateRepository.getTemplateById(request.templateId);
        if (!template) {
          throw new Error('Template not found');
        }
      }

      // Process business cards via AI repository
      return await this.aiProcessingRepository.processBusinessCards({
        files: request.files,
        prompt: request.prompt,
        templateId: request.templateId,
        userId: request.userId
      });
    } catch (error) {
      return {
        extractedData: [],
        generatedResults: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getUserContacts(userId: string, limit?: number, offset?: number) {
    return this.businessCardContactRepository.getAllUserContacts(userId, 1, limit || 50, {});
  }

  async getSessionContacts(sessionId: string) {
    return this.businessCardContactRepository.getContactsBySessionId(sessionId);
  }

  async updateContact(contactId: string, updates: any) {
    return this.businessCardContactRepository.updateContact(contactId, updates);
  }

  async deleteContact(contactId: string) {
    return this.businessCardContactRepository.deleteContact(contactId);
  }

  async getUserSessions(userId: string) {
    return this.businessCardSessionRepository.getUserSessions(userId);
  }
}