import { supabase } from '@/integrations/supabase/client';
import { PackageRepository } from '../../domain/repositories/PackageRepository';
import { Package } from '../../domain/entities/Package';

export class SupabasePackageRepository implements PackageRepository {
  async getAllPackages(): Promise<Package[]> {
    const { data: packages } = await supabase
      .from('packages')
      .select('*')
      .order('tier');

    return packages?.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      tier: pkg.tier,
      creditLimit: pkg.credit_limit,
      priceMonthly: parseFloat(String(pkg.price_monthly || '0')),
      features: (pkg.features as string[]) || [],
      isActive: pkg.is_active || false,
      createdAt: new Date(pkg.created_at || Date.now()),
      updatedAt: new Date(pkg.updated_at || Date.now()),
      stripePriceId: pkg.stripe_price_id ?? undefined,
      billingInterval: (pkg.billing_interval as 'monthly' | 'yearly') || 'monthly',
      stripeYearlyPriceId: pkg.stripe_yearly_price_id ?? undefined,
      isSubscription: pkg.is_subscription || false,
      anonymousLimitId: pkg.anonymous_limit_id ?? undefined,
      stripePaymentUrl: pkg.stripe_payment_url ?? undefined
    })) || [];
  }

  async getActivePackages(): Promise<Package[]> {
    const { data: packages } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('tier');

    return packages?.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      tier: pkg.tier,
      creditLimit: pkg.credit_limit,
      priceMonthly: parseFloat(String(pkg.price_monthly || '0')),
      features: (pkg.features as string[]) || [],
      isActive: pkg.is_active || false,
      createdAt: new Date(pkg.created_at || Date.now()),
      updatedAt: new Date(pkg.updated_at || Date.now()),
      stripePriceId: pkg.stripe_price_id ?? undefined,
      billingInterval: (pkg.billing_interval as 'monthly' | 'yearly') || 'monthly',
      stripeYearlyPriceId: pkg.stripe_yearly_price_id ?? undefined,
      isSubscription: pkg.is_subscription || false,
      anonymousLimitId: pkg.anonymous_limit_id ?? undefined,
      stripePaymentUrl: pkg.stripe_payment_url ?? undefined,
      planDescription: pkg.plan_description ?? undefined,
      resetQuotaOnRenew: pkg.reset_quota_on_renew ?? undefined
    })) || [];
  }

  async getPackageById(id: string): Promise<Package | null> {
    const { data: pkg } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();

    if (!pkg) return null;

    return {
      id: pkg.id,
      name: pkg.name,
      tier: pkg.tier,
      creditLimit: pkg.credit_limit,
      priceMonthly: parseFloat(String(pkg.price_monthly || '0')),
      features: (pkg.features as string[]) || [],
      isActive: pkg.is_active || false,
      createdAt: new Date(pkg.created_at || Date.now()),
      updatedAt: new Date(pkg.updated_at || Date.now()),
      stripePriceId: pkg.stripe_price_id ?? undefined,
      billingInterval: (pkg.billing_interval as 'monthly' | 'yearly') || 'monthly',
      stripeYearlyPriceId: pkg.stripe_yearly_price_id ?? undefined,
      isSubscription: pkg.is_subscription || false,
      anonymousLimitId: pkg.anonymous_limit_id ?? undefined,
      stripePaymentUrl: pkg.stripe_payment_url ?? undefined
    };
  }

  async createPackage(data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    const { data: pkg, error } = await supabase
      .from('packages')
      .insert({
        name: data.name,
        tier: data.tier,
        credit_limit: data.creditLimit,
        price_monthly: data.priceMonthly,
        features: data.features,
        is_active: data.isActive,
        anonymous_limit_id: data.anonymousLimitId
      })
      .select()
      .single();

    if (error || !pkg) {
      throw new Error(error?.message || 'Failed to create package');
    }

    return {
      id: pkg.id,
      name: pkg.name,
      tier: pkg.tier,
      creditLimit: pkg.credit_limit,
      priceMonthly: parseFloat(String(pkg.price_monthly || '0')),
      features: (pkg.features as string[]) || [],
      isActive: pkg.is_active || false,
      createdAt: new Date(pkg.created_at || Date.now()),
      updatedAt: new Date(pkg.updated_at || Date.now()),
      stripePriceId: pkg.stripe_price_id ?? undefined,
      billingInterval: (pkg.billing_interval as 'monthly' | 'yearly') || 'monthly',
      stripeYearlyPriceId: pkg.stripe_yearly_price_id ?? undefined,
      isSubscription: pkg.is_subscription || false,
      anonymousLimitId: pkg.anonymous_limit_id ?? undefined,
      stripePaymentUrl: pkg.stripe_payment_url ?? undefined
    };
  }

  async updatePackage(id: string, data: Partial<Package>): Promise<Package> {
    const { data: pkg, error } = await supabase
      .from('packages')
      .update({
        name: data.name,
        tier: data.tier,
        credit_limit: data.creditLimit,
        price_monthly: data.priceMonthly,
        features: data.features,
        is_active: data.isActive,
        anonymous_limit_id: data.anonymousLimitId
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !pkg) {
      throw new Error(error?.message || 'Failed to update package');
    }

    return {
      id: pkg.id,
      name: pkg.name,
      tier: pkg.tier,
      creditLimit: pkg.credit_limit,
      priceMonthly: parseFloat(String(pkg.price_monthly || '0')),
      features: (pkg.features as string[]) || [],
      isActive: pkg.is_active || false,
      createdAt: new Date(pkg.created_at || Date.now()),
      updatedAt: new Date(pkg.updated_at || Date.now()),
      stripePriceId: pkg.stripe_price_id ?? undefined,
      billingInterval: (pkg.billing_interval as 'monthly' | 'yearly') || 'monthly',
      stripeYearlyPriceId: pkg.stripe_yearly_price_id ?? undefined,
      isSubscription: pkg.is_subscription || false,
      anonymousLimitId: pkg.anonymous_limit_id ?? undefined,
      stripePaymentUrl: pkg.stripe_payment_url ?? undefined
    };
  }

  async deletePackage(id: string): Promise<void> {
    await supabase
      .from('packages')
      .delete()
      .eq('id', id);
  }

  async getSubscriptionPackages(): Promise<Package[]> {
    const { data: packages } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .eq('is_subscription', true)
      .order('tier');

    return packages?.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      tier: pkg.tier,
      creditLimit: pkg.credit_limit,
      priceMonthly: parseFloat(String(pkg.price_monthly || '0')),
      features: (pkg.features as string[]) || [],
      isActive: pkg.is_active || false,
      createdAt: new Date(pkg.created_at || Date.now()),
      updatedAt: new Date(pkg.updated_at || Date.now()),
      stripePriceId: pkg.stripe_price_id ?? undefined,
      billingInterval: (pkg.billing_interval as 'monthly' | 'yearly') || 'monthly',
      stripeYearlyPriceId: pkg.stripe_yearly_price_id ?? undefined,
      isSubscription: pkg.is_subscription || false,
      anonymousLimitId: pkg.anonymous_limit_id ?? undefined,
      stripePaymentUrl: pkg.stripe_payment_url ?? undefined
    })) || [];
  }

  async getOneTimePackages(): Promise<Package[]> {
    const { data: packages } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .neq('is_subscription', true)
      .order('tier');

    return packages?.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      tier: pkg.tier,
      creditLimit: pkg.credit_limit,
      priceMonthly: parseFloat(String(pkg.price_monthly || '0')),
      features: (pkg.features as string[]) || [],
      isActive: pkg.is_active || false,
      createdAt: new Date(pkg.created_at || Date.now()),
      updatedAt: new Date(pkg.updated_at || Date.now()),
      stripePriceId: pkg.stripe_price_id ?? undefined,
      billingInterval: (pkg.billing_interval as 'monthly' | 'yearly') || 'monthly',
      stripeYearlyPriceId: pkg.stripe_yearly_price_id ?? undefined,
      isSubscription: pkg.is_subscription || false,
      anonymousLimitId: pkg.anonymous_limit_id ?? undefined,
      stripePaymentUrl: pkg.stripe_payment_url ?? undefined
    })) || [];
  }
}
