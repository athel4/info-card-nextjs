
import { BusinessCardSessionRepository } from '../../../domain/repositories/BusinessCardSessionRepository';
import { BusinessCardSession } from '../../../domain/entities/BusinessCardSession';

export class SaveBusinessCardSessionUseCase {
  constructor(
    private businessCardSessionRepository: BusinessCardSessionRepository
  ) {}

  async execute(
    userId: string,
    filesProcessed: number,
    promptUsed: string,
    templateId: string | undefined,
    extractedData: any,
    generatedResults: any,
    creditsConsumed: number,
    sessionName?: string
  ): Promise<BusinessCardSession> {
    const sessionData = {
      userId,
      sessionName,
      filesProcessed,
      promptUsed,
      templateId,
      extractedData,
      generatedResults,
      creditsConsumed,
      processingStatus: 'completed'
    };

    return await this.businessCardSessionRepository.createSession(sessionData);
  }
}
