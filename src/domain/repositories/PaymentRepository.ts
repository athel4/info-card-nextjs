import { Payment, CheckoutSession } from '../entities/Payment';

export interface PaymentRepository {
  createCheckoutSession(
    userId: string, 
    packageId: string, 
    userEmail: string
  ): Promise<CheckoutSession>;
  
  createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment>;
  
  updatePaymentStatus(
    stripeSessionId: string, 
    status: Payment['status']
  ): Promise<void>;
  
  getPaymentBySessionId(stripeSessionId: string): Promise<Payment | null>;
  
  getUserPaymentsCnt(userId: string): Promise<number>;
}