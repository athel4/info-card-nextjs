
import { BusinessCardGeneratedResult } from '../entities/BusinessCardGeneratedResult';

export interface BusinessCardGeneratedResultRepository {
  getResultsBySessionId(sessionId: string): Promise<BusinessCardGeneratedResult[]>;
  getResultById(id: string): Promise<BusinessCardGeneratedResult | null>;
  createResult(data: Omit<BusinessCardGeneratedResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCardGeneratedResult>;
  updateResult(id: string, data: Partial<BusinessCardGeneratedResult>): Promise<BusinessCardGeneratedResult>;
  deleteResult(id: string): Promise<void>;
  deleteResultsBySessionId(sessionId: string): Promise<void>;
}
