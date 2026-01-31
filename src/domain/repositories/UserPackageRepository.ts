
import { UserPackage } from '../entities/UserPackage';

export interface UserPackageRepository {
  getUserPackages(userId: string): Promise<UserPackage[]>;
  getAllUserPackages(): Promise<UserPackage[]>;
  getUserActivePackage(userId: string): Promise<UserPackage | null>;
  updateUserPackage(id: string, data: Partial<UserPackage>): Promise<UserPackage>;
  getUserActiveSubscription(userId: string): Promise<UserPackage | null>;
  createUserPackage(data: Omit<UserPackage, 'id'>): Promise<UserPackage>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<UserPackage | null>;
  addBonusCredits(userId: string, credits: number): Promise<void>;
}
