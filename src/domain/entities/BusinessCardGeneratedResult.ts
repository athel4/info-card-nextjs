
export interface BusinessCardGeneratedResult {
  id: string;
  sessionId: string;
  contactId: string;
  type: string;
  title: string;
  content: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
