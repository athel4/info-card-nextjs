
import { DailyCredit } from '../entities/DailyCredit';
import { DailyCreditUsage } from '../entities/DailyCreditUsage';

export interface DailyCreditRepository {
  getDailyCredits(userId?: string, ipAddress?: string): Promise<DailyCredit>;
  deductDailyCredits(userId: string | undefined, ipAddress: string | undefined, creditsToDeduct: number): Promise<boolean>;
  getDailyCreditUsage(userId?: string, ipAddress?: string): Promise<DailyCreditUsage | null>;
  resetDailyCredits(userId?: string, ipAddress?: string): Promise<void>;
  grantDailyCredits(userId?: string, ipAddress?: string): Promise<void>;
}
