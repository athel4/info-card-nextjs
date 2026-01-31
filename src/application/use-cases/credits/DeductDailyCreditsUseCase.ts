
import { DailyCreditRepository } from '../../../domain/repositories/DailyCreditRepository';

export class DeductDailyCreditsUseCase {
  constructor(
    private dailyCreditRepository: DailyCreditRepository
  ) {}

  async execute(userId: string | undefined, ipAddress: string | undefined, creditsToDeduct: number): Promise<boolean> {
    return this.dailyCreditRepository.deductDailyCredits(userId, ipAddress, creditsToDeduct);
  }
}
