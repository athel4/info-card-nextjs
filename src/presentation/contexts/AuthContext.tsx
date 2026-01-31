
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../../domain/entities/User';
import { container } from '../../infrastructure/di/Container';
import { supabase } from '@/integrations/supabase/client';
import { CongratulationsModal } from '@/components/CongratulationsModal';
import { getUserIP } from '../../utils/ipService';
import { sanitizeForLog } from '../../utils/security';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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



// Singleton auth state to prevent multiple initializations
let authInitialized = false;
let cachedUser: User | null = null;
let cachedLoading = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(cachedLoading);
  const [showCongratulations, setShowCongratulations] = useState(false);

  useEffect(() => {
    // Always sync with cached state on mount/re-render
    if (authInitialized) {
      setUser(cachedUser);
      setIsLoading(cachedLoading);
      return;
    }
    authInitialized = true;
    
    // Single session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const minimalUser = createMinimalUser(session.user);
        cachedUser = minimalUser;
        cachedLoading = false;
        setUser(minimalUser);
        setIsLoading(false);
        
        // Check for anonymous data migration on app startup
        const sessionId = localStorage.getItem('anonymous_session_id');
        if (sessionId && typeof sessionId === 'string' && sessionId.length < 100) {
          try {
            await container.businessCardContactRepository.migrateAnonymousContactsToUser(minimalUser.id, sessionId);
            localStorage.removeItem('anonymous_session_id');
            console.log('Anonymous contacts migrated on app startup');
          } catch (error) {
            console.error('Error migrating anonymous contacts on startup:', sanitizeForLog(error));
          }
        }
      } else {
        cachedUser = null;
        cachedLoading = false;
        setUser(null);
        setIsLoading(false);
      }
    });
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Validate inputs
    if (typeof email !== 'string' || typeof password !== 'string' || email.length === 0 || password.length === 0) {
      throw new Error('Invalid input parameters');
    }
    if (fullName && typeof fullName !== 'string') {
      throw new Error('Invalid fullName parameter');
    }
    const newUser = await container.signUpUseCase.execute(email, password, fullName);
    
    // Check if we got a session (email confirmation disabled) or not (email confirmation enabled)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setUser(newUser);
      
      // Show congratulations modal if soft launch bonus is enabled
      const isEnabled = process.env.NEXT_PUBLIC_SOFT_LAUNCH_BONUS_ENABLED === 'true';
      if (isEnabled) {
        setTimeout(() => setShowCongratulations(true), 1000);
      }
      
      // Grant daily credits for new user sign-up
      setTimeout(async () => {
        try {
          if (newUser?.id && typeof newUser.id === 'string') {
            if (typeof newUser.id === 'string' && newUser.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
              await container.grantDailyCreditsUseCase.execute(newUser.id);
            }
            console.log('Daily credits granted for new user sign-up');
          }
        } catch (error) {
          console.error('Error granting daily credits for new user:', sanitizeForLog(error));
        }
      }, 0);
      return { needsEmailConfirmation: false };
    } else {
      return { needsEmailConfirmation: true };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Validate inputs
    if (typeof email !== 'string' || typeof password !== 'string' || email.length === 0 || password.length === 0) {
      throw new Error('Invalid input parameters');
    }
    if (!email.includes('@') || email.length > 254) {
      throw new Error('Invalid email format');
    }
    const loggedInUser = await container.signInUseCase.execute(email, password);
    setUser(loggedInUser);
  };

  const signOut = async () => {
    await container.authRepository.signOut();
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <CongratulationsModal 
        isOpen={showCongratulations} 
        onClose={() => setShowCongratulations(false)} 
      />
    </AuthContext.Provider>
  );
};
