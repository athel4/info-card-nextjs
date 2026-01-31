import { ContactOutreachAction, OutreachPackageRequest } from '../entities/ContactOutreachAction';

export interface ContactOutreachRepository {
  getContactActions(contactId: string): Promise<ContactOutreachAction[]>;
  generateMissingActions(request: OutreachPackageRequest): Promise<ContactOutreachAction[]>;
  getAvailableActionTypes(): Promise<string[]>;
}