export interface Payment {
  id: string;
  userId: string;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  packageId: string;
  creditsPurchased: number;
  createdAt: Date;
  updatedAt: Date;
  stripeSubscriptionId?: string;
  paymentType?: 'one_time' | 'subscription';
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  userId: string;
  packageId: string;
  amount: number;
  credits: number;
}