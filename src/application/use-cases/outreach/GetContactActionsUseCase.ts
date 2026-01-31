import { ContactOutreachRepository } from '../../../domain/repositories/ContactOutreachRepository';
import { ContactOutreachAction } from '../../../domain/entities/ContactOutreachAction';

export class GetContactActionsUseCase {
  constructor(private contactOutreachRepository: ContactOutreachRepository) {}

  async execute(contactId: string): Promise<ContactOutreachAction[]> {
    return this.contactOutreachRepository.getContactActions(contactId);
  }
}