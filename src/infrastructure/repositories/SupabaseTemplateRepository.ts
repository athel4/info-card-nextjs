import { supabase } from '@/integrations/supabase/client';
import { TemplateRepository } from '../../domain/repositories/TemplateRepository';
import { Template } from '../../domain/entities/Template';

export class SupabaseTemplateRepository implements TemplateRepository {
  private readonly sb: any = supabase;

  async getPublicTemplates(): Promise<Template[]> {
    const { data, error } = await this.sb
      .from('prompt_templates')
      .select('*')
      .is('user_id', null)
      .eq('is_active', true)
      .eq('show_in_analyzer_page', true)
      .order('sort_order');

    if (error) throw error;
    return this.mapToTemplates(data || []);
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    const { data, error } = await this.sb
      .from('prompt_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return this.mapToTemplates(data || []);
  }

  async getAllUserTemplates(userId: string): Promise<Template[]> {
    const { data, error } = await this.sb
      .from('prompt_templates')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .eq('is_active', true)
      .eq('show_in_analyzer_page', true)
      .order('sort_order');

    if (error) throw error;
    return this.mapToTemplates(data || []);
  }

  async createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    const { data, error } = await this.sb
      .from('prompt_templates')
      .insert({
        user_id: template.userId,
        name: template.name,
        title: template.title,
        description: template.description,
        prompt_text: template.promptText,
        template_type: template.templateType,
        pattern_text: template.patternText,
        flexibility_level: template.flexibilityLevel,
        required_placeholders: template.requiredPlaceholders,
        generation_cost: template.generationCost,
        is_active: template.isActive,
        sort_order: template.sortOrder
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to create template');
    }
    return this.mapToTemplate(data);
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.promptText !== undefined) updateData.prompt_text = updates.promptText;
    if (updates.templateType !== undefined) updateData.template_type = updates.templateType;
    if (updates.patternText !== undefined) updateData.pattern_text = updates.patternText;
    if (updates.flexibilityLevel !== undefined) updateData.flexibility_level = updates.flexibilityLevel;
    if (updates.requiredPlaceholders !== undefined) updateData.required_placeholders = updates.requiredPlaceholders;
    if (updates.generationCost !== undefined) updateData.generation_cost = updates.generationCost;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

    const { data, error } = await this.sb
      .from('prompt_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to update template');
    }
    return this.mapToTemplate(data);
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await this.sb
      .from('prompt_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getTemplateById(id: string): Promise<Template | null> {
    const { data, error } = await this.sb
      .from('prompt_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? this.mapToTemplate(data) : null;
  }

  private mapToTemplates(data: any[]): Template[] {
    return data.map(item => this.mapToTemplate(item));
  }

  private mapToTemplate(data: any): Template {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      title: data.title,
      description: data.description,
      promptText: data.prompt_text,
      templateType: data.template_type,
      patternText: data.pattern_text,
      flexibilityLevel: data.flexibility_level as 'strict' | 'medium' | 'flexible',
      requiredPlaceholders: data.required_placeholders || [],
      generationCost: data.generation_cost || 2,
      isActive: data.is_active,
      sortOrder: data.sort_order || 0,
      showInAnalyzerPage: data.show_in_analyzer_page || true,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}
