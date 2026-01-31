
export interface CreditUsage {
  id: string;
  userId: string;
  packageId: string;
  creditsConsumed: number;
  operationType: string;
  operationDetails?: Record<string, any>;
  createdAt: Date;
}
