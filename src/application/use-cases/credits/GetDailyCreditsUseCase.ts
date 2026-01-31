
import { DailyCreditRepository } from '../../../domain/repositories/DailyCreditRepository';
import { DailyCredit } from '../../../domain/entities/DailyCredit';

export class GetDailyCreditsUseCase {
  constructor(
    private dailyCreditRepository: DailyCreditRepository
  ) {}

  async execute(userId?: string, ipAddress?: string): Promise<DailyCredit> {
    return this.dailyCreditRepository.getDailyCredits(userId, ipAddress);
  }
}
