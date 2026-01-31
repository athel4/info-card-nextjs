import { PackageRepository } from '../../domain/repositories/PackageRepository';
import { UserPackageRepository } from '../../domain/repositories/UserPackageRepository';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { Package } from '../../domain/entities/Package';

export interface CreateCheckoutRequest {
  userId: string;
  packageId: string;
  userEmail: string;
}

export interface CreateCheckoutResponse {
  url: string;
  sessionId: string;
  resumed?: boolean;
}

export class PaymentApplicationService {
  constructor(
    private packageRepository: PackageRepository,
    private userPackageRepository: UserPackageRepository,
    private paymentRepository: PaymentRepository
  ) {}

  async getActivePackages(): Promise<Package[]> {
    return this.packageRepository.getActivePackages();
  }

  async createCheckoutSession(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    // Get package details
    const eligibility = await this.validatePackageEligibility(request);

    // Create checkout session via payment repository
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

async validatePackageEligibility(request: CreateCheckoutRequest): Promise<boolean> {
  // Get package details
  const packageData = await this.packageRepository.getPackageById(request.packageId);
  if (!packageData) {
    throw new Error('Package not found');
  }

  // Get user's current active package
  const currentUserPackage = await this.userPackageRepository.getUserActivePackage(request.userId);

  // Validate package selection
  if (currentUserPackage) {
    // Block switching to the exact same package
    if (currentUserPackage.packageId === request.packageId) {
      throw new Error('You are already on this package');
    }

    const currentCredits = currentUserPackage.package?.creditLimit || 0;
    const selectedCredits = packageData.creditLimit;

    const isDowngrade = currentCredits > selectedCredits;

    // If downgrade, apply strict validation
    if (isDowngrade) {
      await this.validateDowngrade(request.userId, currentUserPackage.startedAt);
    }

    // Block switching to a package with the exact same credits
    if (currentCredits === selectedCredits) {
      throw new Error('Cannot switch to a package with the same credit limit');
    }
  }

  return true;
}

private async validateDowngrade(userId: string, packageStartDate: Date): Promise<void> {
  const paymentHistoryCnt = await this.paymentRepository.getUserPaymentsCnt(userId);

  // Only consider completed/successful payments
  //const completedPayments = paymentHistory.filter(p => p.status === 'completed');

  // Calculate how many months the current package has been active
  const monthsActive = (Date.now() - packageStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  /**
   * FINAL RULE:
   * Downgrade is only allowed if:
   * - User has been active for >= 4 months, OR
   * - User has 2 or more completed payments
   */
  if (monthsActive < 4 && paymentHistoryCnt < 2) {
    throw new Error(`⚠️ Finish strong: Downgrades unlock after 4 months.`);
  }
}}