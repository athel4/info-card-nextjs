export interface ContactOutreachAction {
  id: string;
  contactId: string;
  type: 'whatsapp' | 'email' | 'linkedin' | 'call' | 'custom';
  title: string;
  content?: string;
  actionUrl?: string;
  isGenerated: boolean;
  templateId?: string;
  createdAt: Date;
}

export interface OutreachPackageRequest {
  contactId: string;
  templateId: string;
  //missingTemplateTypes: string[];
  estimatedCost: number;
}