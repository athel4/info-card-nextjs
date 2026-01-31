import { PackageRepository } from '../../domain/repositories/PackageRepository';
import { UserPackageRepository } from '../../domain/repositories/UserPackageRepository';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { Package } from '../../domain/entities/Package';
import { UserPackage } from '../../domain/entities/UserPackage';

export interface CreateSubscriptionRequest {
  userId: string;
  packageId: string;
  userEmail: string;
  billingInterval: 'monthly' | 'yearly';
}

export interface CreateSubscriptionResponse {
  url: string;
  sessionId: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  packageName?: string;
  packageTier?: string;
  currentPeriodEnd?: Date;
  status?: string;
  cancelAtPeriodEnd?: boolean;
}

export class SubscriptionApplicationService {
  constructor(
    private packageRepository: PackageRepository,
    private userPackageRepository: UserPackageRepository,
    private paymentRepository: PaymentRepository
  ) {}

  async getSubscriptionPackages(): Promise<Package[]> {
    return this.packageRepository.getSubscriptionPackages();
  }

  async getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const subscription = await this.userPackageRepository.getUserActiveSubscription(userId);
    
    if (!subscription || !subscription.isActive || subscription.subscriptionStatus !== 'active') {
      return { isSubscribed: false };
    }

    return {
      isSubscribed: true,
      packageName: subscription.package?.name,
      packageTier: subscription.package?.tier,
      currentPeriodEnd: subscription.currentPeriodEnd,
      status: subscription.subscriptionStatus,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    };
  }

  async createSubscriptionCheckout(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    // Validate package exists and is a subscription package
    const packageData = await this.packageRepository.getPackageById(request.packageId);
    if (!packageData) {
      throw new Error('Package not found');
    }
    
    if (!packageData.isSubscription) {
      throw new Error('Package is not a subscription package');
    }

    // Check if user already has active subscription
    const currentSubscription = await this.userPackageRepository.getUserActiveSubscription(request.userId);
    if (currentSubscription?.isActive && currentSubscription.subscriptionStatus === 'active') {
      throw new Error('User already has an active subscription');
    }

    // Create checkout session through payment repository
    const checkoutSession = await this.paymentRepository.createCheckoutSession(
      request.userId, 
      request.packageId, 
      request.userEmail
    );
    
    return {
      url: checkoutSession.checkoutUrl,
      sessionId: checkoutSession.sessionId
    };
  }

  async updateSubscriptionStatus(
    stripeSubscriptionId: string, 
    status: string, 
    currentPeriodStart?: Date, 
    currentPeriodEnd?: Date,
    cancelAtPeriodEnd?: boolean
  ): Promise<void> {
    const subscription = await this.userPackageRepository.getSubscriptionByStripeId(stripeSubscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await this.userPackageRepository.updateUserPackage(subscription.id, {
      subscriptionStatus: status as any,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      isActive: status === 'active'
    });
  }

  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.userPackageRepository.getUserActiveSubscription(userId);
    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    // Mark for cancellation at period end
    await this.userPackageRepository.updateUserPackage(subscription.id, {
      cancelAtPeriodEnd: true
    });
  }
}