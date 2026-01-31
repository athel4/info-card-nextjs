import { supabase } from '@/integrations/supabase/client';
import { ContactOutreachRepository } from '../../domain/repositories/ContactOutreachRepository';
import { ContactOutreachAction, OutreachPackageRequest } from '../../domain/entities/ContactOutreachAction';

export class SupabaseContactOutreachRepository implements ContactOutreachRepository {
  private readonly sb: any = supabase;

  async getContactActions(contactId: string): Promise<ContactOutreachAction[]> {
    // Get existing generated results for this contact
    const { data: results, error } = await this.sb
      .from('business_card_generated_results')
      .select('*')
      .eq('contact_id', contactId);

    if (error) throw error;

    // Transform to ContactOutreachAction format
    const actions: ContactOutreachAction[] = results?.map((result: any) => ({
      id: result.id,
      contactId: result.contact_id,
      type: result.type,
      title: result.title,
      content: result.content,
      actionUrl: result.action_url,
      isGenerated: true,
      templateId: result.metadata?.template_id,
      createdAt: new Date(result.created_at || Date.now())
    })) || [];

    // Add basic contact actions (email, phone) if they exist
    const { data: contact } = await this.sb
      .from('business_card_contacts')
      .select('primary_email, primary_phone')
      .eq('id', contactId)
      .single();

    if (contact?.primary_email) {
      actions.push({
        id: `email_${contactId}`,
        contactId,
        type: 'email',
        title: 'Send Email',
        actionUrl: `mailto:${contact.primary_email}`,
        isGenerated: false,
        createdAt: new Date()
      });
    }

    if (contact?.primary_phone) {
      actions.push({
        id: `call_${contactId}`,
        contactId,
        type: 'call',
        title: 'Call',
        actionUrl: `tel:${contact.primary_phone}`,
        isGenerated: false,
        createdAt: new Date()
      });
    }

    return actions;
  }

  async generateMissingActions(request: OutreachPackageRequest): Promise<ContactOutreachAction[]> {
    const { data, error } = await this.sb.functions.invoke('genCompleteOutreachPackage', {
      body: {
        contactId: request.contactId,
        templateId: request.templateId,
        force: false
      }
    });
    
    if (error) throw error;

    return data.generated || [];
  }

  async getAvailableActionTypes(): Promise<string[]> {
    const { data, error } = await this.sb
      .from('prompt_templates')
      .select('template_type')
      .eq('is_active', true);

    if (error) throw error;

    const templateTypes = data?.map((t: any) => t.template_type) || [];
    const allTypes = ['email', 'call', ...templateTypes];
    return [...new Set(allTypes)];
  }
}
