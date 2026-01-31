import { PaymentRepository } from '../../../domain/repositories/PaymentRepository';
import { UserPackageRepository } from '../../../domain/repositories/UserPackageRepository';

export class ProcessPaymentWebhookUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private userPackageRepository: UserPackageRepository
  ) {}

  async execute(stripeSessionId: string, paymentStatus: string, metadata: Record<string, string>): Promise<void> {
    const { userId, packageId, credits } = metadata;
    
    if (paymentStatus === 'paid') {
      // Check if payment already processed
      const existingPayment = await this.paymentRepository.getPaymentBySessionId(stripeSessionId);
      if (existingPayment) {
        console.log('Payment already processed');
        return;
      }

      // Create payment record
      await this.paymentRepository.createPayment({
        userId,
        stripeSessionId,
        amount: parseInt(metadata.amount || '0'),
        currency: 'usd',
        status: 'completed',
        packageId,
        creditsPurchased: parseInt(credits)
      });

      // Add credits to user package
      const userPackage = await this.userPackageRepository.getUserActivePackage(userId);
      
      if (userPackage) {
        // Update existing package
        await this.userPackageRepository.updateUserPackage(userPackage.id, {
          creditsRemaining: userPackage.creditsRemaining + parseInt(credits)
        });
      } else {
        // Create new package (this would need to be implemented)
        console.log('Need to create new user package');
      }
    } else {
      // Handle failed payment
      await this.paymentRepository.createPayment({
        userId,
        stripeSessionId,
        amount: parseInt(metadata.amount || '0'),
        currency: 'usd',
        status: 'failed',
        packageId,
        creditsPurchased: 0
      });
    }
  }
}