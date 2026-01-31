import { BusinessCardContactRepository } from '../../domain/repositories/BusinessCardContactRepository';
import { ContactOutreachRepository } from '../../domain/repositories/ContactOutreachRepository';
import { BusinessCardSessionRepository } from '../../domain/repositories/BusinessCardSessionRepository';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { ContactOutreachAction } from '../../domain/entities/ContactOutreachAction';
import { ContactFilters } from '../use-cases/contacts/GetAllUserContactsUseCase';

export class ContactApplicationService {
  constructor(
    private businessCardContactRepository: BusinessCardContactRepository,
    private contactOutreachRepository: ContactOutreachRepository,
    private businessCardSessionRepository: BusinessCardSessionRepository
  ) {}

  async getAllUserContacts(userId: string, limit: number, page: number, filters: ContactFilters) {
    return this.businessCardContactRepository.getAllUserContacts(userId, page + 1, limit, filters);
  }

  async getSessionContacts(sessionId: string): Promise<BusinessCardContact[]> {
    return this.businessCardContactRepository.getContactsBySessionId(sessionId);
  }

  async createContact(userId: string, contactData: Partial<BusinessCardContact>): Promise<BusinessCardContact> {
    // Get the latest session ID for this user
    const userSessions = await this.businessCardSessionRepository.getUserSessions(userId);
    const latestSessionId = userSessions.length > 0 ? userSessions[0].id : null;
    
    if (!latestSessionId) {
      throw new Error('No existing session found for user. Please process a business card first.');
    }

    const contactWithUser = {
      ...contactData,
      userId,
      sessionId: latestSessionId
    };
    return this.businessCardContactRepository.createContact(contactWithUser);
  }



  async updateContact(contactId: string, updates: Partial<BusinessCardContact>): Promise<BusinessCardContact> {
    return this.businessCardContactRepository.updateContact(contactId, updates);
  }

  async deleteContact(contactId: string): Promise<void> {
    return this.businessCardContactRepository.deleteContact(contactId);
  }

  async getContactActions(contactId: string): Promise<ContactOutreachAction[]> {
    return this.contactOutreachRepository.getContactActions(contactId);
  }
}