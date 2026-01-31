
import { Package } from './Package';

export interface UserPackage {
  id: string;
  userId: string;
  packageId: string;
  creditsRemaining: number;
  creditsUsed: number;
  startedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  package?: Package;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  subscriptionItemId?: string;
}
