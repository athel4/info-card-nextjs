import { UserPackageHistoryRepository } from '../../../domain/repositories/UserPackageHistoryRepository';
import { UserPackageHistory } from '../../../domain/entities/UserPackageHistory';

export class GetUserPackageHistoryUseCase {
  constructor(
    private userPackageHistoryRepository: UserPackageHistoryRepository
  ) {}

  async execute(userId: string): Promise<UserPackageHistory | null> {
    return this.userPackageHistoryRepository.getUserPackageHistory(userId);
  }
}