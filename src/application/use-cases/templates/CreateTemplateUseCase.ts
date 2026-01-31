
import { TemplateRepository } from '../../../domain/repositories/TemplateRepository';
import { Template } from '../../../domain/entities/Template';

export class CreateTemplateUseCase {
  constructor(private templateRepository: TemplateRepository) {}

  async execute(
    userId: string,
    templateData: {
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
  ): Promise<Template> {
    // Validate required fields
    if (!templateData.name || !templateData.title || !templateData.promptText) {
      throw new Error('Name, title, and prompt text are required');
    }

    const template = await this.templateRepository.createTemplate({
      userId,
      name: templateData.name,
      title: templateData.title,
      description: templateData.description,
      promptText: templateData.promptText,
      templateType: templateData.templateType || 'custom',
      patternText: templateData.patternText,
      flexibilityLevel: templateData.flexibilityLevel || 'medium',
      requiredPlaceholders: templateData.requiredPlaceholders || [],
      generationCost: templateData.generationCost || 2,
      isActive: true,
      sortOrder: 0,
      showInAnalyzerPage: true
    });

    return template;
  }
}
