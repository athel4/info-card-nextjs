import { supabase } from '@/integrations/supabase/client';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import { sanitizeForLog } from '../../utils/security';

export class SupabaseAuthRepository implements AuthRepository {
  async signUp(email: string, password: string, fullName?: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName || ''
        }
      }
    });

    if (error) {
      console.error('Supabase signUp error:', sanitizeForLog(error.message));
      throw new Error('Authentication failed');
    }
    if (!data.user) throw new Error('Failed to create user');

    // If email confirmation is required, return a placeholder user
    if (!data.session) {
      return {
        id: data.user.id,
        email: data.user.email!,
        fullName: fullName || '',
        role: 'end_user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Only try to fetch profile if we have a session
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile) {
      // Return user data even if profile fetch fails (will be created by trigger)
      return {
        id: data.user.id,
        email: data.user.email!,
        fullName: fullName || '',
        role: 'end_user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name || undefined,
      role: profile.role,
      createdAt: new Date(profile.created_at || new Date()),
      updatedAt: new Date(profile.updated_at || new Date())
    };
  }

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase signIn error:', sanitizeForLog(error.message));
      throw new Error('Authentication failed');
    }
    if (!data.user) throw new Error('Failed to sign in');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) throw new Error('User profile not found');

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name || undefined,
      role: profile.role,
      createdAt: new Date(profile.created_at || new Date()),
      updatedAt: new Date(profile.updated_at || new Date())
    };
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signOut error:', sanitizeForLog(error.message));
      throw new Error('Sign out failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name || undefined,
      role: profile.role,
      createdAt: new Date(profile.created_at || new Date()),
      updatedAt: new Date(profile.updated_at || new Date())
    };
  }

  async getCurrentSession(): Promise<any> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase getSession error:', sanitizeForLog(error.message));
      throw new Error('Session retrieval failed');
    }
    return session;
  }
}