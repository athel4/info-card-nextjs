
import { ActivityLog } from '../entities/ActivityLog';

export interface ActivityLogRepository {
  getUserActivityLogs(userId: string): Promise<ActivityLog[]>;
  getAllActivityLogs(): Promise<ActivityLog[]>;
  createActivityLog(data: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog>;
}
