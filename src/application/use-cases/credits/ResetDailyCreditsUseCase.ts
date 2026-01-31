
import { DailyCreditRepository } from '../../../domain/repositories/DailyCreditRepository';

export class ResetDailyCreditsUseCase {
  constructor(
    private dailyCreditRepository: DailyCreditRepository
  ) {}

  async execute(userId?: string, ipAddress?: string): Promise<void> {
    return this.dailyCreditRepository.resetDailyCredits(userId, ipAddress);
  }
}
