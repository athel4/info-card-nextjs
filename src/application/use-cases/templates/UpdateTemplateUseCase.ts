
import { TemplateRepository } from '../../../domain/repositories/TemplateRepository';
import { Template } from '../../../domain/entities/Template';

export class UpdateTemplateUseCase {
  constructor(private templateRepository: TemplateRepository) {}

  async execute(
    templateId: string,
    updates: Partial<{
      name: string;
      title: string;
      description: string;
      promptText: string;
      templateType: string;
      patternText: string;
      flexibilityLevel: 'strict' | 'medium' | 'flexible';
      requiredPlaceholders: string[];
      generationCost: number;
      isActive: boolean;
    }>
  ): Promise<Template> {
    return await this.templateRepository.updateTemplate(templateId, updates);
  }
}
