export interface SubscriptionCheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  customerId?: string;
}

export interface CustomerPortalSession {
  url: string;
}