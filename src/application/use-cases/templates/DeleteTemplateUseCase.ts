
import { TemplateRepository } from '../../../domain/repositories/TemplateRepository';

export class DeleteTemplateUseCase {
  constructor(private templateRepository: TemplateRepository) {}

  async execute(templateId: string): Promise<void> {
    await this.templateRepository.deleteTemplate(templateId);
  }
}
