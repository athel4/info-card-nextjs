
import { BusinessCardContactRepository } from '../../../domain/repositories/BusinessCardContactRepository';
import { BusinessCardContact } from '../../../domain/entities/BusinessCardContact';

export class UpdateBusinessCardContactUseCase {
  constructor(
    private businessCardContactRepository: BusinessCardContactRepository
  ) {}

  async execute(contactId: string, updates: Partial<BusinessCardContact>): Promise<BusinessCardContact> {
    return await this.businessCardContactRepository.updateContact(contactId, updates);
  }
}
