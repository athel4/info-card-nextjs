import { SubscriptionRepository } from '../../../domain/repositories/subscription/SubscriptionRepository';
import { SubscriptionPlan } from '../../../domain/entities/subscription/SubscriptionPlan';
import { SubscriptionCheckoutSession, CustomerPortalSession } from '../../../domain/entities/subscription/SubscriptionCheckoutSession';

export class SupabaseSubscriptionRepository implements SubscriptionRepository {
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    // TODO: Implement when subscription_plans table is created
    return [];
  }

  async getPlanById(id: string): Promise<SubscriptionPlan | null> {
    // TODO: Implement when subscription_plans table is created
    return null;
  }

  async createPlan(planData: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan> {
    // TODO: Implement when subscription_plans table is created
    throw new Error('Subscription plans table not yet created');
  }

  async updatePlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    // TODO: Implement when subscription_plans table is created
    throw new Error('Subscription plans table not yet created');
  }

  async createCheckoutSession(
    userId: string, 
    planId: string, 
    userEmail: string
  ): Promise<SubscriptionCheckoutSession> {
    // TODO: Implement when subscription edge functions are created
    throw new Error('Subscription checkout not yet implemented');
  }

  async createCustomerPortalSession(userId: string): Promise<CustomerPortalSession> {
    // TODO: Implement when subscription edge functions are created  
    throw new Error('Customer portal not yet implemented');
  }

  async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    // TODO: Implement when subscription edge functions are created
    throw new Error('Subscription cancellation not yet implemented');
  }

  private mapToPlan(data: any): SubscriptionPlan {
    return {
      id: data.id,
      name: data.name,
      tier: data.tier,
      priceMonthly: data.price_monthly,
      priceYearly: data.price_yearly,
      features: data.features || [],
      stripeMonthlyPriceId: data.stripe_monthly_price_id,
      stripeYearlyPriceId: data.stripe_yearly_price_id,
      isActive: data.is_active ?? false,
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now())
    };
  }
}
