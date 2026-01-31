import { supabase } from '@/integrations/supabase/client';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { Payment, CheckoutSession } from '../../domain/entities/Payment';

export class SupabasePaymentRepository implements PaymentRepository {
  private readonly sb: any = supabase;

  async createCheckoutSession(
    userId: string, 
    packageId: string, 
    userEmail: string
  ): Promise<CheckoutSession> {
    // Get package details
    const { data: packageData, error: packageError } = await this.sb
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      throw new Error('Package not found');
    }

    // Call Stripe checkout edge function
    const { data, error } = await this.sb.functions.invoke('stripe-checkout', {
      body: { packageId }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to create checkout session');
    }
    
    return {
      sessionId: data?.sessionId || '',
      checkoutUrl: data?.url || '',
      userId,
      packageId,
      amount: Math.round(Number(packageData.price_monthly) * 100),
      credits: packageData.credit_limit
    };
  }

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const { data, error } = await this.sb
      .from('payments')
      .insert({
        user_id: payment.userId,
        stripe_session_id: payment.stripeSessionId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        package_id: payment.packageId,
        credits_purchased: payment.creditsPurchased,
        stripe_subscription_id: payment.stripeSubscriptionId,
        payment_type: payment.paymentType
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToPayment(data);
  }

  async updatePaymentStatus(stripeSessionId: string, status: Payment['status']): Promise<void> {
    const { error } = await this.sb
      .from('payments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_session_id', stripeSessionId);

    if (error) throw error;
  }

  async getPaymentBySessionId(stripeSessionId: string): Promise<Payment | null> {
    const { data, error } = await this.sb
      .from('payments')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .maybeSingle();

    if (error) return null;
    return data ? this.mapToPayment(data) : null;
  }

  async getUserPaymentsCnt(userId: string): Promise<number> {
    const { count, error } = await this.sb
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) throw error;
    return count || 0;
  }

  private mapToPayment(data: any): Payment {
    return {
      id: data.id,
      userId: data.user_id,
      stripeSessionId: data.stripe_session_id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      packageId: data.package_id,
      creditsPurchased: data.credits_purchased,
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now()),
      stripeSubscriptionId: data.stripe_subscription_id,
      paymentType: data.payment_type
    };
  }
}
