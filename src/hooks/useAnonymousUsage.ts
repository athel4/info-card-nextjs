
interface AnonymousUsage {
  processingCalls: number;
  lastReset: string;
}

const STORAGE_KEY = 'anonymous_usage';
const MAX_CALLS = 3;
const RESET_INTERVAL_HOURS = 24;

export const useAnonymousUsage = () => {
  const getUsage = (): AnonymousUsage => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { processingCalls: 0, lastReset: new Date().toISOString() };
      }
      
      const usage: AnonymousUsage = JSON.parse(stored);
      const lastReset = new Date(usage.lastReset);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
      
      // Reset usage if 24 hours have passed
      if (hoursDiff >= RESET_INTERVAL_HOURS) {
        const resetUsage = { processingCalls: 0, lastReset: now.toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resetUsage));
        return resetUsage;
      }
      
      return usage;
    } catch (error) {
      console.error('Error reading anonymous usage:', error);
      return { processingCalls: 0, lastReset: new Date().toISOString() };
    }
  };

  const canProcess = (): boolean => {
    const usage = getUsage();
    return usage.processingCalls < MAX_CALLS;
  };

  const getRemainingCalls = (): number => {
    const usage = getUsage();
    return Math.max(0, MAX_CALLS - usage.processingCalls);
  };

  const incrementUsage = (): boolean => {
    if (!canProcess()) {
      return false;
    }
    
    try {
      const usage = getUsage();
      const newUsage = {
        ...usage,
        processingCalls: usage.processingCalls + 1
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      return true;
    } catch (error) {
      console.error('Error updating anonymous usage:', error);
      return false;
    }
  };

  const getTimeUntilReset = (): number => {
    const usage = getUsage();
    const lastReset = new Date(usage.lastReset);
    const nextReset = new Date(lastReset.getTime() + (RESET_INTERVAL_HOURS * 60 * 60 * 1000));
    const now = new Date();
    return Math.max(0, nextReset.getTime() - now.getTime());
  };

  return {
    canProcess,
    getRemainingCalls,
    incrementUsage,
    getTimeUntilReset,
    getUsage
  };
};
