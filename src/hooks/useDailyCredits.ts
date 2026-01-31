'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../presentation/contexts/AuthContext';
import { useApplicationServices } from '../presentation/contexts/ApplicationServiceContext';
import { getUserIP } from '../utils/ipService';
import { sanitizeForLog } from '../utils/security';

interface DailyCreditInfo {
  dailyLimit: number;
  creditsUsed: number;
  creditsRemaining: number;
  resetIntervalHours: number;
  lastReset: Date;
}

export const useDailyCredits = (shouldLoad: boolean = true) => {
  const [creditInfo, setCreditInfo] = useState<DailyCreditInfo>({ 
    dailyLimit: 0, // Will be loaded from DB
    creditsUsed: 0, 
    creditsRemaining: 0,
    resetIntervalHours: 24,
    lastReset: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userIP, setUserIP] = useState<string>('');
  const { user } = useAuth();
  const { creditService } = useApplicationServices();




  const fetchDailyCredits = async (ip?: string, isRefresh: boolean = false) => {
    try {
      
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const ipToUse = ip || userIP;
      console.log('Fetching daily credits for:', user ? `user ${sanitizeForLog(user.id)}` : `IP ${sanitizeForLog(ipToUse)}`);
      console.log('User object in fetchDailyCredits:', sanitizeForLog(user));
      
      const credits = await creditService.getDailyCredits(
        user?.id,
        user ? undefined : ipToUse
      );

      console.log('Daily credits fetched:', sanitizeForLog(credits));
      setCreditInfo(credits);
    } catch (error) {
      console.error('Error fetching daily credits:', sanitizeForLog(error));
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!shouldLoad) return;
    
    const initializeCredits = async () => {
      console.log('initializeCredits called, user:', user?.id);
      if (user === null) {
        // For anonymous users, get IP using consistent method
        const ip = await getUserIP();
        setUserIP(ip);
        await fetchDailyCredits(ip, false);
      } else if (user) {
        // For authenticated users
        console.log('User detected, using user-based daily credits');
        await fetchDailyCredits(undefined, false);
      }
      // If user is undefined, wait for auth to settle
    };

    initializeCredits();
  }, [user, shouldLoad]);  

  const canProcess = (creditsToProcess: number = 1): boolean => {
    return creditInfo.creditsRemaining >= creditsToProcess;
  };

  const getRemainingCredits = (): number => {
    return creditInfo.creditsRemaining;
  };

  const getTimeUntilReset = (): number => {
    // Calculate time until next midnight (server timezone - UTC)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    return Math.max(0, tomorrow.getTime() - now.getTime());
  };

  const refreshCredits = useCallback(async () => {
    console.log('Refreshing credits...');
    console.log('Current creditInfo before refresh:', creditInfo);
    if (!user) {
      const ip = await getUserIP();
      await fetchDailyCredits(ip, true);
    } else {
      await fetchDailyCredits(undefined, true);
    }
    console.log('Current creditInfo after refresh:', creditInfo);
  }, [user, creditInfo]);  

  return {
    canProcess,
    getRemainingCredits,
    getTimeUntilReset,
    getCreditInfo: () => creditInfo,
    getUserIP: () => userIP,
    isLoading: isLoading || isRefreshing,
    isRefreshing,
    refreshCredits
  };
};