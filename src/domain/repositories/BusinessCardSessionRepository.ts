
import { BusinessCardSession } from '../entities/BusinessCardSession';

export interface BusinessCardSessionRepository {
  getUserSessions(userId: string): Promise<BusinessCardSession[]>;
  getSessionById(id: string): Promise<BusinessCardSession | null>;
  createSession(data: Omit<BusinessCardSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCardSession>;
  updateSession(id: string, data: Partial<BusinessCardSession>): Promise<BusinessCardSession>;
  deleteSession(id: string): Promise<void>;
}
