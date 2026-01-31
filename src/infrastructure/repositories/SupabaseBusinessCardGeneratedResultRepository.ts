
import { supabase } from '../../integrations/supabase/client';
import { BusinessCardGeneratedResult } from '../../domain/entities/BusinessCardGeneratedResult';
import { BusinessCardGeneratedResultRepository } from '../../domain/repositories/BusinessCardGeneratedResultRepository';

export class SupabaseBusinessCardGeneratedResultRepository implements BusinessCardGeneratedResultRepository {
  async getResultsBySessionId(sessionId: string): Promise<BusinessCardGeneratedResult[]> {
    const { data, error } = await supabase
      .from('business_card_generated_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch generated results: ${error.message}`);
    }

    return (data || []).map(this.mapToEntity);
  }

  async getResultById(id: string): Promise<BusinessCardGeneratedResult | null> {
    const { data, error } = await supabase
      .from('business_card_generated_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch generated result: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async createResult(resultData: Omit<BusinessCardGeneratedResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCardGeneratedResult> {
    const { data, error } = await supabase
      .from('business_card_generated_results')
      .insert({
        session_id: resultData.sessionId,
        contact_id: resultData.contactId,
        type: resultData.type,
        title: resultData.title,
        content: resultData.content,
        action_url: resultData.actionUrl,
        metadata: resultData.metadata
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create generated result');
    }

    return this.mapToEntity(data);
  }

  async updateResult(id: string, updates: Partial<BusinessCardGeneratedResult>): Promise<BusinessCardGeneratedResult> {
    const { data, error } = await supabase
      .from('business_card_generated_results')
      .update({
        session_id: updates.sessionId,
        contact_id: updates.contactId,
        type: updates.type,
        title: updates.title,
        content: updates.content,
        action_url: updates.actionUrl,
        metadata: updates.metadata
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update generated result');
    }

    return this.mapToEntity(data);
  }

  async deleteResult(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_card_generated_results')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete generated result: ${error.message}`);
    }
  }

  async deleteResultsBySessionId(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('business_card_generated_results')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      throw new Error(`Failed to delete generated results: ${error.message}`);
    }
  }

  private mapToEntity(data: any): BusinessCardGeneratedResult {
    return {
      id: data.id,
      sessionId: data.session_id ?? undefined,
      contactId: data.contact_id ?? undefined,
      type: data.type ?? '',
      title: data.title ?? undefined,
      content: data.content ?? undefined,
      actionUrl: data.action_url ?? undefined,
      metadata: data.metadata ?? undefined,
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now())
    };
  }
}
