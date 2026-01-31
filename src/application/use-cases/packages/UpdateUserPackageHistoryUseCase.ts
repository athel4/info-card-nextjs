import { UserPackageHistoryRepository } from '../../../domain/repositories/UserPackageHistoryRepository';

export class UpdateUserPackageHistoryUseCase {
  constructor(
    private userPackageHistoryRepository: UserPackageHistoryRepository
  ) {}

  async execute(userId: string, packageId: string): Promise<void> {
    return this.userPackageHistoryRepository.updateUserPackageHistory(userId, packageId);
  }
}