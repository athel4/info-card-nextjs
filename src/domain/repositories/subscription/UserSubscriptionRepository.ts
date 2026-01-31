import { UserSubscription } from '../../entities/subscription/UserSubscription';

export interface UserSubscriptionRepository {
  getUserActiveSubscription(userId: string): Promise<UserSubscription | null>;
  getUserSubscriptions(userId: string): Promise<UserSubscription[]>;
  createSubscription(data: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSubscription>;
  updateSubscription(id: string, data: Partial<UserSubscription>): Promise<UserSubscription>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<UserSubscription | null>;
}