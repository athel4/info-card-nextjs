import { UserPackageHistory } from '../entities/UserPackageHistory';

export interface UserPackageHistoryRepository {
  getUserPackageHistory(userId: string): Promise<UserPackageHistory | null>;
  updateUserPackageHistory(userId: string, packageId: string): Promise<void>;
  createUserPackageHistory(userId: string, packageId: string): Promise<UserPackageHistory>;
}