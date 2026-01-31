import { ContactOutreachRepository } from '../../../domain/repositories/ContactOutreachRepository';
import { DailyCreditRepository } from '../../../domain/repositories/DailyCreditRepository';
import { UserPackageRepository } from '../../../domain/repositories/UserPackageRepository';
import { ContactOutreachAction, OutreachPackageRequest } from '../../../domain/entities/ContactOutreachAction';

export class GenerateOutreachPackageUseCase {
  constructor(
    private contactOutreachRepository: ContactOutreachRepository,
    private dailyCreditRepository: DailyCreditRepository,
    private userPackageRepository: UserPackageRepository
  ) {}

  async execute(
    request: OutreachPackageRequest,
    userId?: string,
    ipAddress?: string
  ): Promise<ContactOutreachAction[]> {
    // Get daily credits remaining
    const dailyCredit = await this.dailyCreditRepository.getDailyCredits(userId, ipAddress);
    const dailyRemaining = dailyCredit.dailyLimit - dailyCredit.creditsUsed;
    
    let packageRemaining = 0;
    if (userId) {
      // Get package credits for authenticated users
      const userPackage = await this.userPackageRepository.getUserActivePackage(userId);
      packageRemaining = userPackage?.creditsRemaining || 0;
    }
    
    // Check combined credits
    const totalAvailable = dailyRemaining + packageRemaining;
    if (totalAvailable < request.estimatedCost) {
      throw new Error(`Insufficient credits. Need ${request.estimatedCost}, have ${totalAvailable} (${dailyRemaining} daily + ${packageRemaining} package)`);
    }
    
    // // Deduct credits (this will handle the mixed deduction logic)
    // const canDeduct = await this.dailyCreditRepository.deductDailyCredits(
    //   userId,
    //   ipAddress,
    //   request.estimatedCost
    // );

    // if (!canDeduct) {
    //   throw new Error('Failed to deduct credits');
    // }

    // Generate missing actions
    return this.contactOutreachRepository.generateMissingActions(request);
  }
}