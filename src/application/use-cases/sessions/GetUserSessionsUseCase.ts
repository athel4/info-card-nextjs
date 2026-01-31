
import { BusinessCardSessionRepository } from '../../../domain/repositories/BusinessCardSessionRepository';
import { BusinessCardSession } from '../../../domain/entities/BusinessCardSession';

export class GetUserSessionsUseCase {
  constructor(
    private businessCardSessionRepository: BusinessCardSessionRepository
  ) {}

  async execute(userId: string): Promise<BusinessCardSession[]> {
    return await this.businessCardSessionRepository.getUserSessions(userId);
  }
}
