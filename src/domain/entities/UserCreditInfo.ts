
export interface UserCreditInfo {
  userId?: string;
  packageId?: string;
  creditsRemaining: number;
  creditsUsed: number;
  totalCredits: number;
  creditLimit?: number;
  startedAt?: Date;
  expiresAt?: Date;
  packageName: string;
  packageTier: string;
}
