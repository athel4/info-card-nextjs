
import { CreditUsage } from '../entities/CreditUsage';

export interface CreditUsageRepository {
  getUserCreditUsage(userId: string): Promise<CreditUsage[]>;
  getAllCreditUsage(): Promise<CreditUsage[]>;
  createCreditUsage(data: Omit<CreditUsage, 'id' | 'createdAt'>): Promise<CreditUsage>;
  getCreditUsageStats(userId?: string): Promise<{
    totalCreditsUsed: number;
    usageByType: Record<string, number>;
    usageByMonth: Record<string, number>;
  }>;
}
