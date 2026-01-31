
import { TemplateRepository } from '../../../domain/repositories/TemplateRepository';
import { Template } from '../../../domain/entities/Template';

export class GetUserTemplatesUseCase {
  constructor(private templateRepository: TemplateRepository) {}

  async execute(userId: string): Promise<Template[]> {
    return await this.templateRepository.getAllUserTemplates(userId);
  }

  async executeUserOnly(userId: string): Promise<Template[]> {
    return await this.templateRepository.getUserTemplates(userId);
  }

  async executePublicOnly(): Promise<Template[]> {
    return await this.templateRepository.getPublicTemplates();
  }
}
