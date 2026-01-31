
import { supabase } from '@/integrations/supabase/client';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

export class SupabaseUserRepository implements UserRepository {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      stripeAccId: (profile as any).stripe_acc_id || undefined,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      stripeAccId: (profile as any).stripe_acc_id || undefined,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    };
  }

  async getAllUsers(): Promise<User[]> {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return profiles?.map(profile => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      stripeAccId: (profile as any).stripe_acc_id || undefined,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    })) || [];
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        role: data.role
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !profile) {
      throw new Error(error?.message || 'Failed to update user');
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      stripeAccId: (profile as any).stripe_acc_id || undefined,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    };
  }
}
