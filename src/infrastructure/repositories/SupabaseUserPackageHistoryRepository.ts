import { supabase } from '@/integrations/supabase/client';
import { UserPackageHistoryRepository } from '../../domain/repositories/UserPackageHistoryRepository';
import { UserPackageHistory } from '../../domain/entities/UserPackageHistory';

export class SupabaseUserPackageHistoryRepository implements UserPackageHistoryRepository {
  async getUserPackageHistory(userId: string): Promise<UserPackageHistory | null> {
    const { data, error } = await supabase
      .from('user_package_history')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      lastPackageId: data.last_package_id,
      lastUpdated: new Date(data.last_updated || Date.now()),
      createdAt: new Date(data.created_at || Date.now())
    };
  }

  async updateUserPackageHistory(userId: string, packageId: string): Promise<void> {
    const { error } = await supabase
      .from('user_package_history')
      .upsert({
        user_id: userId,
        last_package_id: packageId,
        last_updated: new Date().toISOString()
      });

    if (error) throw error;
  }

  async createUserPackageHistory(userId: string, packageId: string): Promise<UserPackageHistory> {
    const { data, error } = await supabase
      .from('user_package_history')
      .insert({
        user_id: userId,
        last_package_id: packageId
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to create user package history');
    }

    return {
      id: data.id,
      userId: data.user_id,
      lastPackageId: data.last_package_id,
      lastUpdated: new Date(data.last_updated || Date.now()),
      createdAt: new Date(data.created_at || Date.now())
    };
  }
}
