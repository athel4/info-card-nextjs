import { TemplateRepository } from '../../domain/repositories/TemplateRepository';
import { Template } from '../../domain/entities/Template';

export interface CreateTemplateRequest {
  name: string;
  title: string;
  description?: string;
  promptText: string;
  templateType: string;
  patternText?: string;
  flexibilityLevel: 'strict' | 'medium' | 'flexible';
  requiredPlaceholders: string[];
  generationCost?: number;
}

export class TemplateApplicationService {
  constructor(
    private templateRepository: TemplateRepository
  ) {}

  async getPublicTemplates(): Promise<Template[]> {
    return this.templateRepository.getPublicTemplates();
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    return this.templateRepository.getUserTemplates(userId);
  }

  async getAllAvailableTemplates(userId?: string): Promise<Template[]> {
    if (!userId) {
      return this.getPublicTemplates();
    }

    const [publicTemplates, userTemplates] = await Promise.all([
      this.getPublicTemplates(),
      this.getUserTemplates(userId)
    ]);

    // Combine and deduplicate
    const allTemplates = [...publicTemplates, ...userTemplates];
    const uniqueTemplates = allTemplates.filter((template, index, self) => 
      index === self.findIndex(t => t.id === template.id)
    );

    return uniqueTemplates.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createTemplate(userId: string, templateData: CreateTemplateRequest): Promise<Template> {
    return this.templateRepository.createTemplate({
      ...templateData,
      userId,
      isActive: true,
      sortOrder: 999, // User templates at the end
      showInAnalyzerPage: true,
      generationCost: templateData.generationCost || 2
    });
  }

  async updateTemplate(templateId: string, updates: Partial<Template>): Promise<Template> {
    return this.templateRepository.updateTemplate(templateId, updates);
  }

  async deleteTemplate(templateId: string): Promise<void> {
    return this.templateRepository.deleteTemplate(templateId);
  }

  async getTemplateById(templateId: string): Promise<Template | null> {
    return this.templateRepository.getTemplateById(templateId);
  }
}