export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'enterprise';
  priceMonthly: number;
  priceYearly?: number;
  features: string[];
  stripeMonthlyPriceId: string;
  stripeYearlyPriceId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}