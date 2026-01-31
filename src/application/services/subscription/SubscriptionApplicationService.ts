import { SubscriptionRepository } from '../../../domain/repositories/subscription/SubscriptionRepository';
import { UserSubscriptionRepository } from '../../../domain/repositories/subscription/UserSubscriptionRepository';
import { SubscriptionPlan } from '../../../domain/entities/subscription/SubscriptionPlan';
import { UserSubscription } from '../../../domain/entities/subscription/UserSubscription';

export interface CreateSubscriptionRequest {
  userId: string;
  planId: string;
  userEmail: string;
}

export interface CreateSubscriptionResponse {
  url: string;
  sessionId: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  planName?: string;
  planTier?: string;
  expiresAt?: Date;
  status?: string;
}

export class SubscriptionApplicationService {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
    private userSubscriptionRepository: UserSubscriptionRepository
  ) {}

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionRepository.getActivePlans();
  }

  async getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const userSubscription = await this.userSubscriptionRepository.getUserActiveSubscription(userId);
    
    if (!userSubscription || !userSubscription.isActive) {
      return { isSubscribed: false };
    }

    return {
      isSubscribed: true,
      planName: userSubscription.plan?.name,
      planTier: userSubscription.plan?.tier,
      expiresAt: userSubscription.expiresAt,
      status: userSubscription.status
    };
  }

  async createSubscriptionCheckout(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    // Validate plan exists
    const plan = await this.subscriptionRepository.getPlanById(request.planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    // Check if user already has active subscription
    const currentSubscription = await this.userSubscriptionRepository.getUserActiveSubscription(request.userId);
    if (currentSubscription?.isActive) {
      throw new Error('User already has an active subscription');
    }

    // Create Stripe checkout session for subscription
    const checkoutSession = await this.subscriptionRepository.createCheckoutSession(
      request.userId,
      request.planId,
      request.userEmail
    );
    
    return {
      url: checkoutSession.checkoutUrl,
      sessionId: checkoutSession.sessionId
    };
  }

  async createCustomerPortalSession(userId: string): Promise<{ url: string }> {
    const userSubscription = await this.userSubscriptionRepository.getUserActiveSubscription(userId);
    if (!userSubscription) {
      throw new Error('No active subscription found');
    }

    const portalSession = await this.subscriptionRepository.createCustomerPortalSession(userId);
    return { url: portalSession.url };
  }

  async cancelSubscription(userId: string): Promise<void> {
    const userSubscription = await this.userSubscriptionRepository.getUserActiveSubscription(userId);
    if (!userSubscription) {
      throw new Error('No active subscription found');
    }

    await this.subscriptionRepository.cancelSubscription(userSubscription.stripeSubscriptionId);
    
    // Update local record
    await this.userSubscriptionRepository.updateSubscription(userSubscription.id, {
      status: 'canceled',
      isActive: false
    });
  }
}