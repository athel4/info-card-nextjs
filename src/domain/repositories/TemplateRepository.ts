
import { Template } from '../entities/Template';

export interface TemplateRepository {
  getPublicTemplates(): Promise<Template[]>;
  getUserTemplates(userId: string): Promise<Template[]>;
  getAllUserTemplates(userId: string): Promise<Template[]>; // Both public and user templates
  createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template>;
  updateTemplate(id: string, updates: Partial<Template>): Promise<Template>;
  deleteTemplate(id: string): Promise<void>;
  getTemplateById(id: string): Promise<Template | null>;
}
