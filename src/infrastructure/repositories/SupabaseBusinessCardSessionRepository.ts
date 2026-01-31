
import { supabase } from '../../integrations/supabase/client';
import { BusinessCardSession } from '../../domain/entities/BusinessCardSession';
import { BusinessCardSessionRepository } from '../../domain/repositories/BusinessCardSessionRepository';

export class SupabaseBusinessCardSessionRepository implements BusinessCardSessionRepository {
  async getUserSessions(userId: string): Promise<BusinessCardSession[]> {
    const { data, error } = await supabase
      .from('business_card_processing_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user sessions: ${error.message}`);
    }

    return (data || []).map(this.mapToEntity);
  }

  async getSessionById(id: string): Promise<BusinessCardSession | null> {
    const { data, error } = await supabase
      .from('business_card_processing_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch session: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async createSession(sessionData: Omit<BusinessCardSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCardSession> {
    const { data, error } = await supabase
      .from('business_card_processing_sessions')
      .insert({
        user_id: sessionData.userId,
        session_name: sessionData.sessionName,
        files_processed: sessionData.filesProcessed,
        prompt_used: sessionData.promptUsed,
        template_id: sessionData.templateId,
        extracted_data: sessionData.extractedData,
        generated_results: sessionData.generatedResults,
        credits_consumed: sessionData.creditsConsumed,
        processing_status: sessionData.processingStatus
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async updateSession(id: string, updates: Partial<BusinessCardSession>): Promise<BusinessCardSession> {
    const { data, error } = await supabase
      .from('business_card_processing_sessions')
      .update({
        session_name: updates.sessionName,
        files_processed: updates.filesProcessed,
        prompt_used: updates.promptUsed,
        template_id: updates.templateId,
        extracted_data: updates.extractedData,
        generated_results: updates.generatedResults,
        credits_consumed: updates.creditsConsumed,
        processing_status: updates.processingStatus
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_card_processing_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  private mapToEntity(data: any): BusinessCardSession {
    return {
      id: data.id,
      userId: data.user_id ?? undefined,
      sessionName: data.session_name ?? undefined,
      filesProcessed: data.files_processed ?? 0,
      promptUsed: data.prompt_used ?? undefined,
      templateId: data.template_id ?? undefined,
      extractedData: data.extracted_data ?? undefined,
      generatedResults: data.generated_results ?? undefined,
      creditsConsumed: data.credits_consumed ?? 0,
      processingStatus: data.processing_status ?? 'pending',
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now())
    };
  }
}
