
import { BusinessCardContact } from '../entities/BusinessCardContact';
import { ContactFilters, PaginatedContactsResult } from '../../application/use-cases/contacts/GetAllUserContactsUseCase';

export interface BusinessCardContactRepository {
  getAllUserContacts(userId: string, page: number, limit: number, filters: ContactFilters): Promise<PaginatedContactsResult>;
  getContactsBySessionId(sessionId: string): Promise<BusinessCardContact[]>;
  getContactById(id: string): Promise<BusinessCardContact | null>;
  createContact(data: Omit<BusinessCardContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCardContact>;
  updateContact(id: string, data: Partial<BusinessCardContact>): Promise<BusinessCardContact>;
  deleteContact(id: string): Promise<void>;
  deleteContactsBySessionId(sessionId: string): Promise<void>;
  migrateAnonymousContactsToUser(userId: string, sessionId: string): Promise<void>;
}
