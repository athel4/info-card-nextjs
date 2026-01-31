import { SubscriptionPlan } from './SubscriptionPlan';

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  expiresAt?: Date;
  isActive: boolean;
  plan?: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}