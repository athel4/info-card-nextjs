import { supabase } from '@/integrations/supabase/client';
import { UserPackageRepository } from '../../domain/repositories/UserPackageRepository';
import { UserPackage } from '../../domain/entities/UserPackage';

export class SupabaseUserPackageRepository implements UserPackageRepository {
  async getUserPackages(userId: string): Promise<UserPackage[]> {
    const { data: userPackages } = await supabase
      .from('user_packages')
      .select(`
        *,
        packages (*)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    return userPackages?.map(up => ({
      id: up.id,
      userId: up.user_id,
      packageId: up.package_id,
      creditsRemaining: up.credits_remaining,
      creditsUsed: up.credits_used,
      startedAt: new Date(up.started_at || Date.now()),
      expiresAt: up.expires_at ? new Date(up.expires_at) : undefined,
      isActive: up.is_active ?? false,
      package: up.packages ? {
        id: up.packages.id,
        name: up.packages.name,
        tier: up.packages.tier,
        creditLimit: up.packages.credit_limit,
        priceMonthly: parseFloat(String(up.packages.price_monthly || '0')),
        features: (up.packages.features as string[]) || [],
        isActive: up.packages.is_active ?? false,
        createdAt: new Date(up.packages.created_at || Date.now()),
        updatedAt: new Date(up.packages.updated_at || Date.now()),
        billingInterval: (up.packages.billing_interval as 'monthly' | 'yearly') || 'monthly',
        stripeYearlyPriceId: up.packages.stripe_yearly_price_id ?? undefined,
        isSubscription: up.packages.is_subscription || false
      } : undefined,
      stripeSubscriptionId: up.stripe_subscription_id || undefined,
      subscriptionStatus: up.subscription_status || undefined,
      currentPeriodStart: up.current_period_start ? new Date(up.current_period_start) : undefined,
      currentPeriodEnd: up.current_period_end ? new Date(up.current_period_end) : undefined,
      cancelAtPeriodEnd: up.cancel_at_period_end || undefined,
      subscriptionItemId: (up as any).subscription_item_id
    })) || [];
  }

  async getAllUserPackages(): Promise<UserPackage[]> {
    const { data: userPackages } = await supabase
      .from('user_packages')
      .select(`
        *,
        packages (*)
      `)
      .order('started_at', { ascending: false });

    return userPackages?.map(up => ({
      id: up.id,
      userId: up.user_id,
      packageId: up.package_id,
      creditsRemaining: up.credits_remaining,
      creditsUsed: up.credits_used,
      startedAt: new Date(up.started_at || Date.now()),
      expiresAt: up.expires_at ? new Date(up.expires_at) : undefined,
      isActive: up.is_active ?? false,
      package: up.packages ? {
        id: up.packages.id,
        name: up.packages.name,
        tier: up.packages.tier,
        creditLimit: up.packages.credit_limit,
        priceMonthly: parseFloat(String(up.packages.price_monthly || '0')),
        features: (up.packages.features as string[]) || [],
        isActive: up.packages.is_active ?? false,
        createdAt: new Date(up.packages.created_at || Date.now()),
        updatedAt: new Date(up.packages.updated_at || Date.now()),
        billingInterval: (up.packages.billing_interval as 'monthly' | 'yearly') || 'monthly',
        stripeYearlyPriceId: up.packages.stripe_yearly_price_id ?? undefined,
        isSubscription: up.packages.is_subscription || false
      } : undefined,
      stripeSubscriptionId: up.stripe_subscription_id || undefined,
      subscriptionStatus: up.subscription_status || undefined,
      currentPeriodStart: up.current_period_start ? new Date(up.current_period_start) : undefined,
      currentPeriodEnd: up.current_period_end ? new Date(up.current_period_end) : undefined,
      cancelAtPeriodEnd: up.cancel_at_period_end || undefined,
      subscriptionItemId: (up as any).subscription_item_id
    })) || [];
  }

  async getUserActivePackage(userId: string): Promise<UserPackage | null> {
    const { data: userPackage } = await supabase
      .from('user_packages')
      .select(`
        *,
        packages (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (!userPackage) return null;

    return {
      id: userPackage.id,
      userId: userPackage.user_id,
      packageId: userPackage.package_id,
      creditsRemaining: userPackage.credits_remaining,
      creditsUsed: userPackage.credits_used,
      startedAt: new Date(userPackage.started_at || Date.now()),
      expiresAt: userPackage.expires_at ? new Date(userPackage.expires_at) : undefined,
      isActive: userPackage.is_active ?? false,
      package: userPackage.packages ? {
        id: userPackage.packages.id,
        name: userPackage.packages.name,
        tier: userPackage.packages.tier,
        creditLimit: userPackage.packages.credit_limit,
        priceMonthly: parseFloat(String(userPackage.packages.price_monthly || '0')),
        features: (userPackage.packages.features as string[]) || [],
        isActive: userPackage.packages.is_active ?? false,
        createdAt: new Date(userPackage.packages.created_at || Date.now()),
        updatedAt: new Date(userPackage.packages.updated_at || Date.now()),
        billingInterval: (userPackage.packages.billing_interval as 'monthly' | 'yearly') || 'monthly',
        stripeYearlyPriceId: userPackage.packages.stripe_yearly_price_id ?? undefined,
        isSubscription: userPackage.packages.is_subscription || false
      } : undefined,
      stripeSubscriptionId: userPackage.stripe_subscription_id || undefined,
      subscriptionStatus: userPackage.subscription_status || undefined,
      currentPeriodStart: userPackage.current_period_start ? new Date(userPackage.current_period_start) : undefined,
      currentPeriodEnd: userPackage.current_period_end ? new Date(userPackage.current_period_end) : undefined,
      cancelAtPeriodEnd: userPackage.cancel_at_period_end || undefined,
      subscriptionItemId: (userPackage as any).subscription_item_id
    };
  }

  async updateUserPackage(id: string, data: Partial<UserPackage>): Promise<UserPackage> {
    const { data: userPackage, error } = await supabase
      .from('user_packages')
      .update({
        credits_remaining: data.creditsRemaining,
        credits_used: data.creditsUsed,
        expires_at: data.expiresAt?.toISOString(),
        is_active: data.isActive,
        stripe_subscription_id: data.stripeSubscriptionId,
        subscription_status: data.subscriptionStatus,
        current_period_start: data.currentPeriodStart?.toISOString(),
        current_period_end: data.currentPeriodEnd?.toISOString(),
        cancel_at_period_end: data.cancelAtPeriodEnd,
        subscription_item_id: data.subscriptionItemId
      })
      .eq('id', id)
      .select(`
        *,
        packages (*)
      `)
      .single();

    if (error || !userPackage) {
      throw new Error(error?.message || 'Failed to update user package');
    }

    return {
      id: userPackage.id,
      userId: userPackage.user_id,
      packageId: userPackage.package_id,
      creditsRemaining: userPackage.credits_remaining,
      creditsUsed: userPackage.credits_used,
      startedAt: new Date(userPackage.started_at || Date.now()),
      expiresAt: userPackage.expires_at ? new Date(userPackage.expires_at) : undefined,
      isActive: userPackage.is_active ?? false,
      package: userPackage.packages ? {
        id: userPackage.packages.id,
        name: userPackage.packages.name,
        tier: userPackage.packages.tier,
        creditLimit: userPackage.packages.credit_limit,
        priceMonthly: parseFloat(String(userPackage.packages.price_monthly || '0')),
        features: (userPackage.packages.features as string[]) || [],
        isActive: userPackage.packages.is_active ?? false,
        createdAt: new Date(userPackage.packages.created_at || Date.now()),
        updatedAt: new Date(userPackage.packages.updated_at || Date.now()),
        billingInterval: (userPackage.packages.billing_interval as 'monthly' | 'yearly') || 'monthly',
        stripeYearlyPriceId: userPackage.packages.stripe_yearly_price_id ?? undefined,
        isSubscription: userPackage.packages.is_subscription || false
      } : undefined,
      stripeSubscriptionId: userPackage.stripe_subscription_id || undefined,
      subscriptionStatus: userPackage.subscription_status || undefined,
      currentPeriodStart: userPackage.current_period_start ? new Date(userPackage.current_period_start) : undefined,
      currentPeriodEnd: userPackage.current_period_end ? new Date(userPackage.current_period_end) : undefined,
      cancelAtPeriodEnd: userPackage.cancel_at_period_end || undefined,
      subscriptionItemId: (userPackage as any).subscription_item_id
    };
  }

  async getUserActiveSubscription(userId: string): Promise<UserPackage | null> {
    const { data: userPackage } = await supabase
      .from('user_packages')
      .select(`
        *,
        packages (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('subscription_status', 'active')
      .maybeSingle();

    if (!userPackage) return null;

    return {
      id: userPackage.id,
      userId: userPackage.user_id,
      packageId: userPackage.package_id,
      creditsRemaining: userPackage.credits_remaining,
      creditsUsed: userPackage.credits_used,
      startedAt: new Date(userPackage.started_at || Date.now()),
      expiresAt: userPackage.expires_at ? new Date(userPackage.expires_at) : undefined,
      isActive: userPackage.is_active ?? false,
      package: userPackage.packages ? {
        id: userPackage.packages.id,
        name: userPackage.packages.name,
        tier: userPackage.packages.tier,
        creditLimit: userPackage.packages.credit_limit,
        priceMonthly: parseFloat(String(userPackage.packages.price_monthly || '0')),
        features: (userPackage.packages.features as string[]) || [],
        isActive: userPackage.packages.is_active ?? false,
        createdAt: new Date(userPackage.packages.created_at || Date.now()),
        updatedAt: new Date(userPackage.packages.updated_at || Date.now()),
        billingInterval: (userPackage.packages.billing_interval as 'monthly' | 'yearly') || 'monthly',
        stripeYearlyPriceId: userPackage.packages.stripe_yearly_price_id ?? undefined,
        isSubscription: userPackage.packages.is_subscription || false
      } : undefined,
      stripeSubscriptionId: userPackage.stripe_subscription_id || undefined,
      subscriptionStatus: userPackage.subscription_status || undefined,
      currentPeriodStart: userPackage.current_period_start ? new Date(userPackage.current_period_start) : undefined,
      currentPeriodEnd: userPackage.current_period_end ? new Date(userPackage.current_period_end) : undefined,
      cancelAtPeriodEnd: userPackage.cancel_at_period_end || undefined,
      subscriptionItemId: (userPackage as any).subscription_item_id
    };
  }

  async createUserPackage(data: Omit<UserPackage, 'id'>): Promise<UserPackage> {
    const { data: userPackage, error } = await supabase
      .from('user_packages')
      .insert({
        user_id: data.userId,
        package_id: data.packageId,
        credits_remaining: data.creditsRemaining,
        credits_used: data.creditsUsed,
        started_at: data.startedAt.toISOString(),
        expires_at: data.expiresAt?.toISOString(),
        is_active: data.isActive,
        stripe_subscription_id: data.stripeSubscriptionId,
        subscription_status: data.subscriptionStatus,
        current_period_start: data.currentPeriodStart?.toISOString(),
        current_period_end: data.currentPeriodEnd?.toISOString(),
        cancel_at_period_end: data.cancelAtPeriodEnd,
        subscription_item_id: data.subscriptionItemId
      })
      .select(`
        *,
        packages (*)
      `)
      .single();

    if (error || !userPackage) {
      throw new Error(error?.message || 'Failed to create user package');
    }

    return {
      id: userPackage.id,
      userId: userPackage.user_id,
      packageId: userPackage.package_id,
      creditsRemaining: userPackage.credits_remaining,
      creditsUsed: userPackage.credits_used,
      startedAt: new Date(userPackage.started_at || Date.now()),
      expiresAt: userPackage.expires_at ? new Date(userPackage.expires_at) : undefined,
      isActive: userPackage.is_active ?? false,
      package: userPackage.packages ? {
        id: userPackage.packages.id,
        name: userPackage.packages.name,
        tier: userPackage.packages.tier,
        creditLimit: userPackage.packages.credit_limit,
        priceMonthly: parseFloat(String(userPackage.packages.price_monthly || '0')),
        features: (userPackage.packages.features as string[]) || [],
        isActive: userPackage.packages.is_active ?? false,
        createdAt: new Date(userPackage.packages.created_at || Date.now()),
        updatedAt: new Date(userPackage.packages.updated_at || Date.now()),
        billingInterval: (userPackage.packages.billing_interval as 'monthly' | 'yearly') || 'monthly',
        stripeYearlyPriceId: userPackage.packages.stripe_yearly_price_id ?? undefined,
        isSubscription: userPackage.packages.is_subscription || false
      } : undefined,
      stripeSubscriptionId: userPackage.stripe_subscription_id || undefined,
      subscriptionStatus: userPackage.subscription_status || undefined,
      currentPeriodStart: userPackage.current_period_start ? new Date(userPackage.current_period_start) : undefined,
      currentPeriodEnd: userPackage.current_period_end ? new Date(userPackage.current_period_end) : undefined,
      cancelAtPeriodEnd: userPackage.cancel_at_period_end || undefined,
      subscriptionItemId: (userPackage as any).subscription_item_id
    };
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<UserPackage | null> {
    const { data: userPackage } = await supabase
      .from('user_packages')
      .select(`
        *,
        packages (*)
      `)
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle();

    if (!userPackage) return null;

    return {
      id: userPackage.id,
      userId: userPackage.user_id,
      packageId: userPackage.package_id,
      creditsRemaining: userPackage.credits_remaining,
      creditsUsed: userPackage.credits_used,
      startedAt: new Date(userPackage.started_at || Date.now()),
      expiresAt: userPackage.expires_at ? new Date(userPackage.expires_at) : undefined,
      isActive: userPackage.is_active ?? false,
      package: userPackage.packages ? {
        id: userPackage.packages.id,
        name: userPackage.packages.name,
        tier: userPackage.packages.tier,
        creditLimit: userPackage.packages.credit_limit,
        priceMonthly: parseFloat(String(userPackage.packages.price_monthly || '0')),
        features: (userPackage.packages.features as string[]) || [],
        isActive: userPackage.packages.is_active ?? false,
        createdAt: new Date(userPackage.packages.created_at || Date.now()),
        updatedAt: new Date(userPackage.packages.updated_at || Date.now()),
        billingInterval: (userPackage.packages.billing_interval as 'monthly' | 'yearly') || 'monthly',
        stripeYearlyPriceId: userPackage.packages.stripe_yearly_price_id ?? undefined,
        isSubscription: userPackage.packages.is_subscription || false
      } : undefined,
      stripeSubscriptionId: userPackage.stripe_subscription_id || undefined,
      subscriptionStatus: userPackage.subscription_status || undefined,
      currentPeriodStart: userPackage.current_period_start ? new Date(userPackage.current_period_start) : undefined,
      currentPeriodEnd: userPackage.current_period_end ? new Date(userPackage.current_period_end) : undefined,
      cancelAtPeriodEnd: userPackage.cancel_at_period_end || undefined,
      subscriptionItemId: (userPackage as any).subscription_item_id
    };
  }

  async addBonusCredits(userId: string, credits: number): Promise<void> {
    // Fallback implementation without supabase.raw (not available in supabase-js v2)
    const { data, error } = await supabase
      .from('user_packages')
      .select('id, credits_remaining')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Failed to fetch active user package: ${error?.message || 'No active package found'}`);
    }

    const newCreditsRemaining = (data.credits_remaining ?? 0) + credits;

    const { error: updateError } = await supabase
      .from('user_packages')
      .update({ credits_remaining: newCreditsRemaining })
      .eq('id', data.id);

    if (updateError) {
      throw new Error(`Failed to add bonus credits: ${updateError.message}`);
    }
  }
}
