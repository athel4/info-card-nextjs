
import { supabase } from '@/integrations/supabase/client';
import { ActivityLogRepository } from '../../domain/repositories/ActivityLogRepository';
import { ActivityLog } from '../../domain/entities/ActivityLog';

export class SupabaseActivityLogRepository implements ActivityLogRepository {
  async getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
    const { data: activityLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return activityLogs?.map(al => ({
      id: al.id,
      userId: al.user_id,
      action: al.action,
      details: al.details as Record<string, any> | undefined,
      ipAddress: (al.ip_address as string | null) || undefined,
      userAgent: (al.user_agent as string | null) || undefined,
      createdAt: new Date(al.created_at || new Date())
    })) || [];
  }

  async getAllActivityLogs(): Promise<ActivityLog[]> {
    const { data: activityLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    return activityLogs?.map(al => ({
      id: al.id,
      userId: al.user_id,
      action: al.action,
      details: al.details as Record<string, any> | undefined,
      ipAddress: (al.ip_address as string | null) || undefined,
      userAgent: (al.user_agent as string | null) || undefined,
      createdAt: new Date(al.created_at || new Date())
    })) || [];
  }

  async createActivityLog(data: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
    const { data: activityLog } = await supabase
      .from('activity_logs')
      .insert({
        user_id: data.userId,
        action: data.action,
        details: data.details,
        ip_address: data.ipAddress,
        user_agent: data.userAgent
      })
      .select()
      .single();

    if (!activityLog) {
      throw new Error('Failed to create activity log');
    }

    return {
      id: activityLog.id,
      userId: activityLog.user_id,
      action: activityLog.action,
      details: activityLog.details as Record<string, any> | undefined,
      ipAddress: (activityLog.ip_address as string | null) || undefined,
      userAgent: (activityLog.user_agent as string | null) || undefined,
      createdAt: new Date(activityLog.created_at || new Date())
    };
  }
}
