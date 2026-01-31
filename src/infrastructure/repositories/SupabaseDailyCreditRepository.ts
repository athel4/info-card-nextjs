import { supabase } from '@/integrations/supabase/client';
import { DailyCreditRepository } from '../../domain/repositories/DailyCreditRepository';
import { DailyCredit } from '../../domain/entities/DailyCredit';
import { DailyCreditUsage } from '../../domain/entities/DailyCreditUsage';
import { getBrowserFingerprint } from '../../utils/browserFingerprint';
import { sanitizeForLog } from '../../utils/security';

export class SupabaseDailyCreditRepository implements DailyCreditRepository {
  private shouldReset(lastReset: Date, resetIntervalHours: number): boolean {
    const now = new Date();
    const resetIntervalMs = resetIntervalHours * 60 * 60 * 1000;
    return (now.getTime() - lastReset.getTime()) >= resetIntervalMs;
  }

  private getNextResetTime(lastReset: Date, resetIntervalHours: number): Date {
    const resetIntervalMs = resetIntervalHours * 60 * 60 * 1000;
    return new Date(lastReset.getTime() + resetIntervalMs);
  }

  // Use an untyped alias to avoid deep generic inference issues from supabase-js types
  private readonly sb: any = supabase;

  async grantDailyCredits(userId?: string, ipAddress?: string): Promise<void> {
    try {
      console.log('Granting daily credits for:', userId ? `user ${sanitizeForLog(userId)}` : `IP ${sanitizeForLog(ipAddress)}`);
      
      // Get reset interval from user's package or default anonymous limits
      let resetIntervalHours = 24;
      
      if (userId) {
        // Get user's package anonymous_limit_id
        const packageResult = await this.sb
          .from('user_packages')
          .select('packages!inner(anonymous_limit_id)')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();
        
        if (packageResult.data?.packages?.anonymous_limit_id) {
          const limitsResult = await this.sb
            .from('anonymous_limits')
            .select('reset_interval_hours')
            .eq('id', packageResult.data.packages.anonymous_limit_id)
            .single();
          
          resetIntervalHours = limitsResult.data?.reset_interval_hours || 24;
        }
      } else {
        // For anonymous users, use oldest active limits (free account)
        const limitsResult = await this.sb
          .from('anonymous_limits')
          .select('reset_interval_hours')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
        
        resetIntervalHours = limitsResult.data?.reset_interval_hours || 24;
      }
      const usage = await this.getDailyCreditUsage(userId, ipAddress);
    
    if (usage) {
      // Check if reset interval has passed
      if (!this.shouldReset(usage.lastReset, resetIntervalHours)) {
        console.log('Reset interval not reached yet');
        return;
      }
      
      // Grant new credits by resetting usage
      console.log('Reset interval reached - granting new credits');
      const now = new Date();
      const updateResult = await this.sb
        .from('daily_limit_usage')
        .update({ 
          credits_used: 0,
          last_reset: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', usage.id);
        
      if (updateResult.error) {
        console.error('Error granting daily credits:', updateResult.error);
      }
    } else {
      // Create new usage record with credits
      console.log('Creating new usage record with credits');
      const browserFingerprint = !userId ? getBrowserFingerprint() : null;
      const now = new Date();
      
      const insertResult = await this.sb
        .from('daily_limit_usage')
        .insert({
          user_id: userId || null,
          ip_address: userId ? null : ipAddress,
          browser_fingerprint: userId ? null : browserFingerprint,
          credits_used: 0,
          last_reset: now.toISOString()
        });
        
      if (insertResult.error) {
        console.log('Insert failed (likely duplicate), ignoring:', sanitizeForLog(insertResult.error.message));
      }
    }
    } catch (error) {
      console.error('Error granting daily credits:', sanitizeForLog(error));
      // Silently fail - credits will use defaults
    }
  }

  async getDailyCredits(userId?: string, ipAddress?: string): Promise<DailyCredit> {
    console.log('Getting daily credits for:', userId ? `user ${sanitizeForLog(userId)}` : `IP ${sanitizeForLog(ipAddress)}`);
    
    try {
      // Get daily credit limits from user's package or default anonymous limits
      let dailyLimit = 5;
      let resetIntervalHours = 24;
      
      if (userId) {
        // Get user's package anonymous_limit_id
        const packageResult = await this.sb
          .from('user_packages')
          .select('packages!inner(anonymous_limit_id)')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();
        
        if (packageResult.data?.packages?.anonymous_limit_id) {
          const limitsResult = await this.sb
            .from('anonymous_limits')
            .select('daily_credit_limit, reset_interval_hours')
            .eq('id', packageResult.data.packages.anonymous_limit_id)
            .single();
          
          const limits = limitsResult.data;
          dailyLimit = limits?.daily_credit_limit || 5;
          resetIntervalHours = limits?.reset_interval_hours || 24;
        }
      } else {
        // For anonymous users, use oldest active limits (free account)
        const limitsResult = await this.sb
          .from('anonymous_limits')
          .select('daily_credit_limit, reset_interval_hours')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
        
        const limits = limitsResult.data;
        dailyLimit = limits?.daily_credit_limit || 5;
        resetIntervalHours = limits?.reset_interval_hours || 24;
      }
        //console.log('athx1:',ipAddress)

      // Get current usage
      const usage = await this.getDailyCreditUsage(userId, ipAddress);
      let creditsUsed = 0;
      let lastReset = new Date();
      
      if (usage) {
        console.log('Found existing usage record:', sanitizeForLog(usage));
        
        // Check if reset interval has passed
        if (this.shouldReset(usage.lastReset, resetIntervalHours)) {
          console.log('Reset interval passed - granting new credits');
          await this.grantDailyCredits(userId, ipAddress);
          // Re-fetch usage after reset to get updated values
          const updatedUsage = await this.getDailyCreditUsage(userId, ipAddress);
          creditsUsed = updatedUsage?.creditsUsed || 0;
          lastReset = updatedUsage?.lastReset || new Date();
        } else {
          // Use current usage
          creditsUsed = usage.creditsUsed;
          lastReset = usage.lastReset;
        }
      } else {
        console.log('No existing usage record found');
        await this.grantDailyCredits(userId, ipAddress);
        creditsUsed = 0;
      }

      const result: DailyCredit = {
        dailyLimit,
        creditsUsed,
        creditsRemaining: Math.max(0, dailyLimit - creditsUsed),
        resetIntervalHours,
        lastReset
      };

      console.log('Daily credits result:', result);
      return result;
    
    } catch (error) {
      console.error('Error accessing daily credits table:', sanitizeForLog(error));
      // Return default credits if table access fails
      return {
        dailyLimit: 5,
        creditsUsed: 0,
        creditsRemaining: 5,
        resetIntervalHours: 24,
        lastReset: new Date()
      };
    }
  }

  async deductDailyCredits(userId: string | undefined, ipAddress: string | undefined, creditsToDeduct: number): Promise<boolean> {
    console.log('Deducting daily credits:', { userId: sanitizeForLog(userId), ipAddress: sanitizeForLog(ipAddress), creditsToDeduct: sanitizeForLog(creditsToDeduct) });
    
    const currentCredits = await this.getDailyCredits(userId, ipAddress);
    
    if (currentCredits.creditsRemaining < creditsToDeduct) {
      console.log('Insufficient credits:', sanitizeForLog(currentCredits.creditsRemaining), 'needed:', sanitizeForLog(creditsToDeduct));
      return false;
    }

    const usage = await this.getDailyCreditUsage(userId, ipAddress);
    
    if (usage) {
      console.log('Updating existing usage record:', sanitizeForLog(usage.id));
      const updateResult = await this.sb
        .from('daily_limit_usage')
        .update({ 
          credits_used: usage.creditsUsed + creditsToDeduct,
          updated_at: new Date().toISOString()
        })
        .eq('id', usage.id);
        
      if (updateResult.error) {
        console.error('Error updating daily credits:', sanitizeForLog(updateResult.error));
        return false;
      }
      return true;
    } else {
      console.error('No usage record found for credit deduction. Credits must be granted first.');
      return false;
    }
  }

  async getDailyCreditUsage(userId?: string, ipAddress?: string): Promise<DailyCreditUsage | null> {
    if (!userId && !ipAddress) {
      console.log('No userId or ipAddress provided for usage query');
      return null;
    }

    try {
      let queryResult: any;

      if (userId) {
        console.log('Querying by user_id:', sanitizeForLog(userId));
        queryResult = await this.sb
          .from('daily_limit_usage')
          .select('id, user_id, ip_address, browser_fingerprint, credits_used, last_reset, credits_granted_date, created_at, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
      } else {
        const browserFingerprint = getBrowserFingerprint();
        console.log('Querying by ip_address and browser_fingerprint:', sanitizeForLog(ipAddress), sanitizeForLog(browserFingerprint));
        const queryData = await this.sb
          .from('daily_limit_usage')
          .select('id, user_id, ip_address, browser_fingerprint, credits_used, last_reset, credits_granted_date, created_at, updated_at')
          .eq('ip_address', ipAddress as string)
          .eq('browser_fingerprint', browserFingerprint)
          .is('user_id', null)
          .order('updated_at', { ascending: false })
          .limit(1);
        
        queryResult = {
          data: queryData.data?.[0] || null,
          error: queryData.error
        };
      }

      if (queryResult.error) {
        console.error('Error fetching daily credit usage:', sanitizeForLog(queryResult.error));
        return null;
      }

      if (!queryResult.data) {
        console.log('No usage record found');
        return null;
      }

      const data = queryResult.data;
      console.log('Found usage record:', data);//sanitizeForLog(data));

      return {
        id: data.id,
        userId: data.user_id || undefined,
        ipAddress: data.ip_address || undefined,
        creditsUsed: data.credits_used,
        lastReset: new Date(data.last_reset || Date.now()),
        creditsGrantedDate: data.credits_granted_date ? new Date(data.credits_granted_date) : undefined,
        createdAt: new Date(data.created_at || Date.now()),
        updatedAt: new Date(data.updated_at || Date.now()),
        browserFingerprint: data.browser_fingerprint || undefined
      };
    } catch (error) {
      console.error('Exception in getDailyCreditUsage:', sanitizeForLog(error));
      return null;
    }
  }

  async resetDailyCredits(userId?: string, ipAddress?: string): Promise<void> {
    console.log('Resetting daily credits for:', userId ? `user ${sanitizeForLog(userId)}` : `IP ${sanitizeForLog(ipAddress)}`);
    
    const usage = await this.getDailyCreditUsage(userId, ipAddress);
    
    if (usage) {
      const now = new Date();
      const resetResult = await this.sb
        .from('daily_limit_usage')
        .update({ 
          credits_used: 0,
          last_reset: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', usage.id);

      if (resetResult.error) {
        console.error('Error resetting daily credits:', sanitizeForLog(resetResult.error));
      }
    }
  }

  async migrateAnonymousCreditsToUser(userId: string, ipAddress: string): Promise<void> {
    console.log('Migrating anonymous credits to user:', sanitizeForLog(userId), sanitizeForLog(ipAddress));
    
    const browserFingerprint = getBrowserFingerprint();
    
    const anonymousResult = await this.sb
      .from('daily_limit_usage')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('browser_fingerprint', browserFingerprint)
      .is('user_id', null)
      .maybeSingle();
    
    if (!anonymousResult.data) {
      // No anonymous usage found, grant daily credits to the user
      await this.grantDailyCredits(userId, ipAddress);
      return;
    }
    
    const anonymousUsage = anonymousResult.data;
    
    const userResult = await this.sb
      .from('daily_limit_usage')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    const userUsage = userResult.data;
    
    if (userUsage) {
      // User already has a record, merge the credits and grant today's credits
      const todayDateString = new Date().toISOString().split('T')[0];
      const totalCredits = Math.max(anonymousUsage.credits_used, userUsage.credits_used);
      
      await this.sb
        .from('daily_limit_usage')
        .update({
          credits_used: 0, // Reset to 0 since we're granting today's credits
          credits_granted_date: todayDateString,
          updated_at: new Date().toISOString()
        })
        .eq('id', userUsage.id);

      // Clean up anonymous record
      await this.sb
        .from('daily_limit_usage')
        .delete()
        .eq('id', anonymousUsage.id);
    } else {
      // Convert anonymous record to user record and grant today's credits
      const todayDateString = new Date().toISOString().split('T')[0];
      
      await this.sb
        .from('daily_limit_usage')
        .update({
          user_id: userId,
          ip_address: null,
          browser_fingerprint: null,
          credits_used: 0, // Reset to 0 since we're granting today's credits
          credits_granted_date: todayDateString,
          updated_at: new Date().toISOString()
        })
        .eq('id', anonymousUsage.id);
    }
  }
}
