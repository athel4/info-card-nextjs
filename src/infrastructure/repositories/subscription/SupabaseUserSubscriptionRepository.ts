import { UserSubscriptionRepository } from '../../../domain/repositories/subscription/UserSubscriptionRepository';
import { UserSubscription } from '../../../domain/entities/subscription/UserSubscription';

export class SupabaseUserSubscriptionRepository implements UserSubscriptionRepository {
  async getUserActiveSubscription(userId: string): Promise<UserSubscription | null> {
    // TODO: Implement when user_subscriptions table is created
    return null;
  }

  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    // TODO: Implement when user_subscriptions table is created
    return [];
  }

  async createSubscription(subscriptionData: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSubscription> {
    // TODO: Implement when user_subscriptions table is created
    throw new Error('User subscriptions table not yet created');
  }

  async updateSubscription(id: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    // TODO: Implement when user_subscriptions table is created
    throw new Error('User subscriptions table not yet created');
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<UserSubscription | null> {
    // TODO: Implement when user_subscriptions table is created
    return null;
  }
}