
import { UserPackageRepository } from '../../../domain/repositories/UserPackageRepository';
import { UserCreditInfo } from '../../../domain/entities/UserCreditInfo';

export class RefreshUserCreditsUseCase {
  constructor(
    private userPackageRepository: UserPackageRepository
  ) {}

  async execute(userId: string): Promise<UserCreditInfo | null> {
    try {
      const userPackage = await this.userPackageRepository.getUserActivePackage(userId);
      
      if (!userPackage || !userPackage.package) {
        return null;
      }

      return {
        creditsRemaining: userPackage.creditsRemaining,
        creditsUsed: userPackage.creditsUsed,
        totalCredits: userPackage.package.creditLimit,
        packageName: userPackage.package.name,
        packageTier: userPackage.package.tier
      };
    } catch (error) {
      console.error('Error refreshing user credits:', error);
      throw error;
    }
  }
}
