
export interface Package {
  id: string;
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  creditLimit: number;
  priceMonthly: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  stripePriceId?: string;
  billingInterval?: 'monthly' | 'yearly';
  stripeYearlyPriceId?: string;
  isSubscription?: boolean;
  anonymousLimitId?: string;
  stripePaymentUrl?: string;
  allowSelfProfiling?: boolean;
  allowLinkedin?: boolean;
  planDescription?: string;
  reset_quota_on_renew?: boolean;
  isPopular?: boolean;
}
