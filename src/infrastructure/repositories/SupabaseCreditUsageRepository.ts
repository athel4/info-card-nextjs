
import { supabase } from '@/integrations/supabase/client';
import { CreditUsageRepository } from '../../domain/repositories/CreditUsageRepository';
import { CreditUsage } from '../../domain/entities/CreditUsage';

export class SupabaseCreditUsageRepository implements CreditUsageRepository {
  async getUserCreditUsage(userId: string): Promise<CreditUsage[]> {
    const { data: creditUsage } = await supabase
      .from('package_credit_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return creditUsage?.map(cu => ({
      id: cu.id,
      userId: cu.user_id ?? '',
      packageId: cu.package_id ?? undefined,
      creditsConsumed: cu.credits_consumed ?? 0,
      operationType: cu.operation_type ?? '',
      operationDetails: (cu.operation_details as Record<string, any>) ?? undefined,
      createdAt: new Date(cu.created_at || new Date())
    })) || [];
  }

  async getAllCreditUsage(): Promise<CreditUsage[]> {
    const { data: creditUsage } = await supabase
      .from('package_credit_usage')
      .select('*')
      .order('created_at', { ascending: false });

    return creditUsage?.map(cu => ({
      id: cu.id,
      userId: cu.user_id ?? '',
      packageId: cu.package_id ?? undefined,
      creditsConsumed: cu.credits_consumed ?? 0,
      operationType: cu.operation_type ?? '',
      operationDetails: (cu.operation_details as Record<string, any>) ?? undefined,
      createdAt: new Date(cu.created_at || new Date())
    })) || [];
  }

  async createCreditUsage(data: Omit<CreditUsage, 'id' | 'createdAt'>): Promise<CreditUsage> {
    const { data: creditUsage } = await supabase
      .from('package_credit_usage')
      .insert({
        user_id: data.userId,
        package_id: data.packageId,
        credits_consumed: data.creditsConsumed,
        operation_type: data.operationType,
        operation_details: data.operationDetails
      })
      .select()
      .single();

    if (!creditUsage) {
      throw new Error('Failed to create credit usage');
    }

    return {
      id: creditUsage.id,
      userId: creditUsage.user_id ?? '',
      packageId: creditUsage.package_id ?? undefined,
      creditsConsumed: creditUsage.credits_consumed ?? 0,
      operationType: creditUsage.operation_type ?? '',
      operationDetails: (creditUsage.operation_details as Record<string, any>) ?? undefined,
      createdAt: new Date(creditUsage.created_at || new Date())
    };
  }

  async getCreditUsageStats(userId?: string): Promise<{
    totalCreditsUsed: number;
    usageByType: Record<string, number>;
    usageByMonth: Record<string, number>;
  }> {
    let query = supabase
      .from('package_credit_usage')
      .select('credits_consumed, operation_type, created_at');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: creditUsage } = await query;

    if (!creditUsage) {
      return {
        totalCreditsUsed: 0,
        usageByType: {},
        usageByMonth: {}
      };
    }

    const totalCreditsUsed = creditUsage.reduce((sum, cu) => sum + cu.credits_consumed, 0);

    const usageByType = creditUsage.reduce((acc, cu) => {
      acc[cu.operation_type] = (acc[cu.operation_type] || 0) + cu.credits_consumed;
      return acc;
    }, {} as Record<string, number>);

    const usageByMonth = creditUsage.reduce((acc, cu) => {
      const month = new Date(cu.created_at || new Date()).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + cu.credits_consumed;
      return acc;
    }, {} as Record<string, number>);

    return { totalCreditsUsed, usageByType, usageByMonth };
  }
}
