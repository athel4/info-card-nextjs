
import { DailyCreditRepository } from '../../../domain/repositories/DailyCreditRepository';

export class GrantDailyCreditsUseCase {
  constructor(
    private dailyCreditRepository: DailyCreditRepository
  ) {}

  async execute(userId?: string, ipAddress?: string): Promise<void> {
    return this.dailyCreditRepository.grantDailyCredits(userId, ipAddress);
  }
}
