
export interface DailyCreditUsage {
  id: string;
  userId?: string;
  ipAddress?: string;
  creditsUsed: number;
  lastReset: Date;
  creditsGrantedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  browserFingerprint?: string;
}
