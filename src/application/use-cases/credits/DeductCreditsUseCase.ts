
import { UserPackageRepository } from '../../../domain/repositories/UserPackageRepository';
import { CreditUsageRepository } from '../../../domain/repositories/CreditUsageRepository';
import { ActivityLogRepository } from '../../../domain/repositories/ActivityLogRepository';

export class DeductCreditsUseCase {
  constructor(
    private userPackageRepository: UserPackageRepository,
    private creditUsageRepository: CreditUsageRepository,
    private activityLogRepository: ActivityLogRepository
  ) {}

  async execute(
    userId: string,
    creditsToDeduct: number,
    operationType: string,
    operationDetails?: Record<string, any>
  ): Promise<boolean> {
    const userPackage = await this.userPackageRepository.getUserActivePackage(userId);
    
    if (!userPackage || userPackage.creditsRemaining < creditsToDeduct) {
      return false;
    }

    // Update user package credits
    await this.userPackageRepository.updateUserPackage(userPackage.id, {
      creditsRemaining: userPackage.creditsRemaining - creditsToDeduct,
      creditsUsed: userPackage.creditsUsed + creditsToDeduct
    });

    // Log credit usage
    await this.creditUsageRepository.createCreditUsage({
      userId,
      packageId: userPackage.packageId,
      creditsConsumed: creditsToDeduct,
      operationType,
      operationDetails
    });

    // Log activity
    await this.activityLogRepository.createActivityLog({
      userId,
      action: 'credits_deducted',
      details: { creditsDeducted: creditsToDeduct, operationType, operationDetails }
    });

    return true;
  }
}
