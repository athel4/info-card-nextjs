import { PaymentRepository } from '../../../domain/repositories/PaymentRepository';
import { CheckoutSession } from '../../../domain/entities/Payment';

export class CreateCheckoutSessionUseCase {
  constructor(private paymentRepository: PaymentRepository) {}

  async execute(userId: string, packageId: string, userEmail: string): Promise<CheckoutSession> {
    return await this.paymentRepository.createCheckoutSession(userId, packageId, userEmail);
  }
}