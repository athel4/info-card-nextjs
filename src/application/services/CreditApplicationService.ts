import { UserPackageRepository } from '../../domain/repositories/UserPackageRepository';
import { DailyCreditRepository } from '../../domain/repositories/DailyCreditRepository';
import { UserCreditInfo } from '../../domain/entities/UserCreditInfo';
import { UpdateCreditsUseCase } from '../use-cases/credits/UpdateCreditsUseCase';
import { safeStringify } from '../../utils/security';

export interface CreditInfo {
  dailyLimit: number;
  creditsUsed: number;
  creditsRemaining: number;
  resetIntervalHours: number;
  lastReset: Date;
}

export class CreditApplicationService {
  constructor(
    private userPackageRepository: UserPackageRepository,
    private dailyCreditRepository: DailyCreditRepository,
    private updateCreditsUseCase: UpdateCreditsUseCase
  ) {}

  async getUserCredits(userId: string): Promise<UserCreditInfo | null> {
    const userPackage = await this.userPackageRepository.getUserActivePackage(userId);
    if (!userPackage || !userPackage.package) {
      return null;
    }

    return {
      userId,
      packageId: userPackage.packageId,
      packageName: userPackage.package.name,
      packageTier: userPackage.package.tier,
      creditsRemaining: userPackage.creditsRemaining,
      creditsUsed: userPackage.creditsUsed,
      totalCredits: userPackage.creditsRemaining + userPackage.creditsUsed,
      creditLimit: userPackage.package.creditLimit,
      startedAt: userPackage.startedAt,
      expiresAt: userPackage.expiresAt
    };
  }

  async getDailyCredits(userId?: string, ipAddress?: string): Promise<CreditInfo> {
    return this.dailyCreditRepository.getDailyCredits(userId, ipAddress);
  }

  async refreshCredits(userId?: string, ipAddress?: string): Promise<{
    userCredits: UserCreditInfo | null;
    dailyCredits: CreditInfo;
  }> {
    const [userCredits, dailyCredits] = await Promise.all([
      userId ? this.getUserCredits(userId) : Promise.resolve(null),
      this.getDailyCredits(userId, ipAddress)
    ]);

    return { userCredits, dailyCredits };
  }

  updateCredits(creditInfo: UserCreditInfo, creditsUsed: number): UserCreditInfo {
    // Validate inputs
    if (typeof creditsUsed !== 'number' || creditsUsed < 0) {
      throw new Error('Invalid credits amount');
    }
    return this.updateCreditsUseCase.execute(creditInfo, creditsUsed);
  }

  canProcess(
    dailyCreditsRemaining: number,
    packageCreditsRemaining: number,
    creditsToProcess: number = 1,
    hasUser: boolean = false
  ): boolean {
    if (!hasUser) {
      return dailyCreditsRemaining >= creditsToProcess;
    }

    // For authenticated users: daily credits OR package credits OR combined
    if (dailyCreditsRemaining >= creditsToProcess) {
      return true;
    }

    if (packageCreditsRemaining >= creditsToProcess) {
      return true;
    }

    const totalAvailable = dailyCreditsRemaining + packageCreditsRemaining;
    return totalAvailable >= creditsToProcess;
  }

  getTotalRemainingCredits(
    dailyCreditsRemaining: number,
    packageCreditsRemaining: number = 0,
    hasUser: boolean = false
  ): number {
    if (hasUser) {
      return dailyCreditsRemaining + packageCreditsRemaining;
    }
    return dailyCreditsRemaining;
  }
}