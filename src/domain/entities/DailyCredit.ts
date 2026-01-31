
export interface DailyCredit {
  dailyLimit: number;
  creditsUsed: number;
  creditsRemaining: number;
  resetIntervalHours: number;
  lastReset: Date;
}
