'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useApplicationServices } from './ApplicationServiceContext';
import { UserCreditInfo } from '../../domain/entities/UserCreditInfo';
import { useDailyCredits } from '../../hooks/useDailyCredits';

interface CreditContextType {
  creditInfo: UserCreditInfo | null;
  dailyCredits: {
    dailyLimit: number;
    creditsUsed: number;
    creditsRemaining: number;
    resetIntervalHours: number;
    lastReset: Date;
  };
  isLoading: boolean;
  isRefreshing: boolean;
  refreshCredits: () => Promise<void>;
  updateCredits: (creditsUsed: number) => void;
  canProcess: (creditsToProcess?: number) => boolean;
  getTotalRemainingCredits: () => number;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { creditService } = useApplicationServices();
  const pathname = usePathname();
  const [creditInfo, setCreditInfo] = useState<UserCreditInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shouldLoadCredits, setShouldLoadCredits] = useState(false);
  
  // Use daily credits hook for the 5 daily credits system - but only when shouldLoadCredits is true
  const {
    getCreditInfo: getDailyCreditInfo,
    canProcess: canProcessDaily,
    getRemainingCredits: getRemainingDailyCredits,
    refreshCredits: refreshDailyCredits,
    isLoading: isDailyLoading,
    isRefreshing: isDailyRefreshing
  } = useDailyCredits(shouldLoadCredits);

  const dailyCredits = getDailyCreditInfo();

  const fetchUserCredits = async () => {
    console.log('fetchUserCredits called, user:', user?.id);
    if (!user) {
      console.log('No user, setting creditInfo to null');
      setCreditInfo(null);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching user package credits for user:', user.id);
      const credits = await creditService.getUserCredits(user.id);
      console.log('User package credits fetched:', credits);
      setCreditInfo(credits);
    } catch (error) {
      console.error('Error fetching user credits:', error);
      setCreditInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserCredits = async () => {
    if (!user) return;

    setIsRefreshing(true);
    try {
      const credits = await creditService.getUserCredits(user.id);
      setCreditInfo(credits);
    } catch (error) {
      console.error('Error refreshing user credits:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshCredits = async () => {
    await Promise.all([
      refreshDailyCredits(),
      user ? refreshUserCredits() : Promise.resolve()
    ]);
  };

  const updateCredits = (creditsUsed: number) => {
    if (creditInfo) {
      const updatedCredits = creditService.updateCredits(creditInfo, creditsUsed);
      setCreditInfo(updatedCredits);
    }
  };

  const canProcess = (creditsToProcess: number = 1): boolean => {
    const dailyAvailable = getRemainingDailyCredits();
    
    // For anonymous users, only daily credits are available
    if (!user || !creditInfo) {
      return dailyAvailable >= creditsToProcess;
    }
    
    // For authenticated users, use enhanced logic:
    // 1. Check if daily credits alone can cover it
    if (dailyAvailable >= creditsToProcess) {
      return true;
    }
    
    // 2. Check if package credits alone can cover it
    if (creditInfo.creditsRemaining >= creditsToProcess) {
      return true;
    }
    
    // 3. Check if combined daily + package credits can cover it
    const totalAvailable = dailyAvailable + creditInfo.creditsRemaining;
    return totalAvailable >= creditsToProcess;
  };

  const getTotalRemainingCredits = (): number => {
    const dailyRemaining = getRemainingDailyCredits();
    const packageRemaining = creditInfo?.creditsRemaining || 0;
    
    console.log('getTotalRemainingCredits:', {
      dailyRemaining,
      packageRemaining,
      user: !!user,
      creditInfo: !!creditInfo,
      dailyCredits
    });
    
    if (user && creditInfo) {
      return dailyRemaining + packageRemaining;
    }
    
    return dailyRemaining;
  };

  // Delay credit loading until other components settle
  useEffect(() => {
    if (user !== undefined) { // Wait for auth to settle
      setShouldLoadCredits(true);
    }
  }, [user]);

  useEffect(() => {
    if (shouldLoadCredits && user) {
      fetchUserCredits();
    }
  }, [shouldLoadCredits, user]);  

  // Refresh credits on route changes
  useEffect(() => {
    if (user && shouldLoadCredits) {
      refreshCredits();
    }
  }, [pathname, user, shouldLoadCredits]);  

  // Refresh credits on page focus (handles page reload/tab switching)
  useEffect(() => {
    const handleFocus = () => {
      if (user && shouldLoadCredits) {
        refreshCredits();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, shouldLoadCredits]);  

  const totalIsLoading = isLoading || isDailyLoading;
  const totalIsRefreshing = isRefreshing || isDailyRefreshing;

  return (
    <CreditContext.Provider value={{
      creditInfo,
      dailyCredits,
      isLoading: totalIsLoading,
      isRefreshing: totalIsRefreshing,
      refreshCredits,
      updateCredits,
      canProcess,
      getTotalRemainingCredits
    }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredit = (): CreditContextType => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredit must be used within a CreditProvider');
  }
  return context;
};
