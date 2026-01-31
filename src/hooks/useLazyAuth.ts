'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from '../domain/entities/User';
import { supabase } from '@/integrations/supabase/client';

// Global auth state - only initialized once per page load
const globalAuthState: {
  user: User | null;
  isLoading: boolean;
  initialized: boolean;
} = {
  user: null,
  isLoading: true,
  initialized: false
};

const createMinimalUser = (supabaseUser: any): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    fullName: supabaseUser.user_metadata?.full_name || '',
    role: 'end_user',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const useLazyAuth = () => {
  const [user, setUser] = useState(globalAuthState.user);
  const [isLoading, setIsLoading] = useState(globalAuthState.isLoading);
  const initRef = useRef(false);

  useEffect(() => {
    // Only initialize once globally
    if (globalAuthState.initialized || initRef.current) {
      setUser(globalAuthState.user);
      setIsLoading(globalAuthState.isLoading);
      return;
    }

    initRef.current = true;
    globalAuthState.initialized = true;

    // Single auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const minimalUser = createMinimalUser(session.user);
        globalAuthState.user = minimalUser;
        globalAuthState.isLoading = false;
        setUser(minimalUser);
        setIsLoading(false);
      } else {
        globalAuthState.user = null;
        globalAuthState.isLoading = false;
        setUser(null);
        setIsLoading(false);
      }
    });
  }, []);

  return { user, isLoading };
};