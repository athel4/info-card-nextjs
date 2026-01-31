
import { BusinessCardContactRepository } from '../../../domain/repositories/BusinessCardContactRepository';

export class DeleteContactUseCase {
  constructor(
    private businessCardContactRepository: BusinessCardContactRepository
  ) {}

  async execute(contactId: string): Promise<void> {
    await this.businessCardContactRepository.deleteContact(contactId);
  }
}
