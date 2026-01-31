
import { BusinessCardContactRepository } from '../../../domain/repositories/BusinessCardContactRepository';
import { BusinessCardContact } from '../../../domain/entities/BusinessCardContact';

export class GetSessionContactsUseCase {
  constructor(
    private businessCardContactRepository: BusinessCardContactRepository
  ) {}

  async execute(sessionId: string): Promise<BusinessCardContact[]> {
    return await this.businessCardContactRepository.getContactsBySessionId(sessionId);
  }
}
