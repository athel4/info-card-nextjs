
import { BusinessCardContactRepository } from '../../../domain/repositories/BusinessCardContactRepository';
import { BusinessCardContact } from '../../../domain/entities/BusinessCardContact';

export class CreateBusinessCardContactUseCase {
  constructor(
    private businessCardContactRepository: BusinessCardContactRepository
  ) {}

  async execute(contactData: Omit<BusinessCardContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCardContact> {
    return await this.businessCardContactRepository.createContact(contactData);
  }
}
