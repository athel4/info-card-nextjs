import { SubscriptionPlan } from '../../entities/subscription/SubscriptionPlan';
import { SubscriptionCheckoutSession, CustomerPortalSession } from '../../entities/subscription/SubscriptionCheckoutSession';

export interface SubscriptionRepository {
  getActivePlans(): Promise<SubscriptionPlan[]>;
  getPlanById(id: string): Promise<SubscriptionPlan | null>;
  createPlan(data: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan>;
  updatePlan(id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
  
  createCheckoutSession(
    userId: string, 
    planId: string, 
    userEmail: string
  ): Promise<SubscriptionCheckoutSession>;
  
  createCustomerPortalSession(userId: string): Promise<CustomerPortalSession>;
  
  cancelSubscription(stripeSubscriptionId: string): Promise<void>;
}