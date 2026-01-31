import { UserPackageRepository } from '../../../domain/repositories/UserPackageRepository';
import { sanitizeForLog } from '../../../utils/security';

export class GrantSoftLaunchBonusUseCase {
  constructor(
    private userPackageRepository: UserPackageRepository
  ) {}

  async execute(userId: string): Promise<void> {
    // Check if soft launch bonus is enabled
    const isEnabled = process.env.NEXT_PUBLIC_SOFT_LAUNCH_BONUS_ENABLED === 'true';
    if (!isEnabled) {
      console.log('Soft launch bonus is disabled');
      return;
    }

    const bonusCredits = 50;
    console.log(`Granting soft launch bonus: ${sanitizeForLog(bonusCredits)} credits to user ${sanitizeForLog(userId)}`);
    
    await this.userPackageRepository.addBonusCredits(userId, bonusCredits);
  }
}