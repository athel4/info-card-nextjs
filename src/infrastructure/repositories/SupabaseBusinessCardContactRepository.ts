
import { supabase } from '../../integrations/supabase/client';
import { BusinessCardContact } from '../../domain/entities/BusinessCardContact';
import { BusinessCardContactRepository } from '../../domain/repositories/BusinessCardContactRepository';
import { ContactFilters, PaginatedContactsResult } from '../../application/use-cases/contacts/GetAllUserContactsUseCase';

export class SupabaseBusinessCardContactRepository implements BusinessCardContactRepository {
  async getAllUserContacts(
    userId: string,
    page: number = 1,
    limit: number = 25,
    filters: ContactFilters = {}
  ): Promise<PaginatedContactsResult> {
    // Fetch session IDs for the user (cannot use subquery in PostgREST filters)
    const { data: sessions, error: sessionsError } = await supabase
      .from('business_card_contacts')
      .select('id')
      .eq('user_id', userId);

    if (sessionsError) {
      throw new Error(`Failed to fetch user sessions: ${sessionsError.message}`);
    }

    let query = supabase
      .from('business_card_contacts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply search filter with multi-term support
    if (filters.search) {
      const searchTerms = filters.search.split(',').map(term => term.trim()).filter(term => term.length > 0);
      
      if (searchTerms.length === 1) {
        // Single term search
        const searchTerm = `%${searchTerms[0]}%`;
        query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},company.ilike.${searchTerm},primary_email.ilike.${searchTerm}`);
      } else if (searchTerms.length > 1) {
        // Multi-term search - build OR conditions for each term
        const pieces: string[] = [];
        for (const t of searchTerms) {
          const s = `%${t}%`;
          pieces.push(
            `first_name.ilike.${s}`,
            `last_name.ilike.${s}`,
            `company.ilike.${s}`,
            `primary_email.ilike.${s}`
          );
        }
        const orString = pieces.join(',');
        query = query.or(orString);
      }
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case 'week':
          // Start of the current week (assuming Sunday as start)
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          // Start of the current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          // Start of the current quarter
          const currentQuarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      query = query.gte('created_at', startDate.toISOString());
    }

    // Apply company filter (Case-insensitive partial match)
    if (filters.company) {
      query = query.ilike('company', `%${filters.company}%`);
    }

    // Handle Completeness Filter
    // If completeness filter is active, we must fetch all matching rows first to filter in memory correctly
    if (filters.completeness && filters.completeness !== 'all') {
      // Do NOT apply range/limit here yet
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch user contacts: ${error.message}`);
      }

      let allContacts = (data || []).map(this.mapToEntity);

      // Apply completeness filter in memory
      allContacts = allContacts.filter(contact => {
        const completeness = this.calculateCompleteness(contact);
        switch (filters.completeness) {
          case 'high':
            return completeness >= 80;
          case 'medium':
            return completeness >= 50 && completeness < 80;
          case 'low':
            return completeness < 50;
          default:
            return true;
        }
      });

      const totalCount = allContacts.length;
      const from = (page - 1) * limit;
      const to = from + limit;
      const contacts = allContacts.slice(from, to);
      const hasMore = totalCount > (page * limit);

      return {
        contacts,
        totalCount,
        hasMore
      };

    } else {
      // Normal pagination path (Completeness filter not active)
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch user contacts: ${error.message}`);
      }

      const contacts = (data || []).map(this.mapToEntity);
      const totalCount = count || 0;
      const hasMore = totalCount > (page * limit);

      return {
        contacts,
        totalCount,
        hasMore
      };
    }
  }

  async getContactsBySessionId(sessionId: string): Promise<BusinessCardContact[]> {
    const { data, error } = await supabase
      .from('business_card_contacts')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    return (data || []).map(this.mapToEntity);
  }

  async getContactById(id: string): Promise<BusinessCardContact | null> {
    const { data, error } = await supabase
      .from('business_card_contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch contact: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async createContact(contactData: Omit<BusinessCardContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCardContact> {
    const { data, error } = await supabase
      .from('business_card_contacts')
      .insert({
        user_id: contactData.userId || null,
        session_id: contactData.sessionId!,
        anonymous_session_id: contactData.userId ? null : (contactData.anonymousSessionId || null),
        first_name: contactData.firstName,
        middle_name: contactData.middleName,
        last_name: contactData.lastName,
        secondary_first_name: contactData.secondaryFirstName,
        secondary_middle_name: contactData.secondaryMiddleName,
        secondary_last_name: contactData.secondaryLastName,
        tertiary_first_name: contactData.tertiaryFirstName,
        tertiary_middle_name: contactData.tertiaryMiddleName,
        tertiary_last_name: contactData.tertiaryLastName,
        primary_email: contactData.primaryEmail,
        secondary_email: contactData.secondaryEmail,
        tertiary_email: contactData.tertiaryEmail,
        primary_phone: contactData.primaryPhone,
        primary_phone_country_code: contactData.primaryPhoneCountryCode,
        secondary_phone: contactData.secondaryPhone,
        secondary_phone_country_code: contactData.secondaryPhoneCountryCode,
        tertiary_phone: contactData.tertiaryPhone,
        tertiary_phone_country_code: contactData.tertiaryPhoneCountryCode,
        company: contactData.company,
        job_title: contactData.jobTitle,
        department: contactData.department,
        primary_website: contactData.primaryWebsite,
        secondary_website: contactData.secondaryWebsite,
        tertiary_website: contactData.tertiaryWebsite,
        primary_address: contactData.primaryAddress,
        primary_city: contactData.primaryCity,
        primary_state: contactData.primaryState,
        primary_country: contactData.primaryCountry,
        primary_postal_code: contactData.primaryPostalCode,
        secondary_address: contactData.secondaryAddress,
        secondary_city: contactData.secondaryCity,
        secondary_state: contactData.secondaryState,
        secondary_country: contactData.secondaryCountry,
        secondary_postal_code: contactData.secondaryPostalCode,
        tertiary_address: contactData.tertiaryAddress,
        tertiary_city: contactData.tertiaryCity,
        tertiary_state: contactData.tertiaryState,
        tertiary_country: contactData.tertiaryCountry,
        tertiary_postal_code: contactData.tertiaryPostalCode,
        linkedin_url: contactData.linkedinUrl,
        notes: contactData.notes
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create contact: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async updateContact(id: string, updates: Partial<BusinessCardContact>): Promise<BusinessCardContact> {
    const { data, error } = await supabase
      .from('business_card_contacts')
      .update({
        first_name: updates.firstName,
        middle_name: updates.middleName,
        last_name: updates.lastName,
        secondary_first_name: updates.secondaryFirstName,
        secondary_middle_name: updates.secondaryMiddleName,
        secondary_last_name: updates.secondaryLastName,
        tertiary_first_name: updates.tertiaryFirstName,
        tertiary_middle_name: updates.tertiaryMiddleName,
        tertiary_last_name: updates.tertiaryLastName,
        primary_email: updates.primaryEmail,
        secondary_email: updates.secondaryEmail,
        tertiary_email: updates.tertiaryEmail,
        primary_phone: updates.primaryPhone,
        primary_phone_country_code: updates.primaryPhoneCountryCode,
        secondary_phone: updates.secondaryPhone,
        secondary_phone_country_code: updates.secondaryPhoneCountryCode,
        tertiary_phone: updates.tertiaryPhone,
        tertiary_phone_country_code: updates.tertiaryPhoneCountryCode,
        company: updates.company,
        job_title: updates.jobTitle,
        department: updates.department,
        primary_website: updates.primaryWebsite,
        secondary_website: updates.secondaryWebsite,
        tertiary_website: updates.tertiaryWebsite,
        primary_address: updates.primaryAddress,
        primary_city: updates.primaryCity,
        primary_state: updates.primaryState,
        primary_country: updates.primaryCountry,
        primary_postal_code: updates.primaryPostalCode,
        secondary_address: updates.secondaryAddress,
        secondary_city: updates.secondaryCity,
        secondary_state: updates.secondaryState,
        secondary_country: updates.secondaryCountry,
        secondary_postal_code: updates.secondaryPostalCode,
        tertiary_address: updates.tertiaryAddress,
        tertiary_city: updates.tertiaryCity,
        tertiary_state: updates.tertiaryState,
        tertiary_country: updates.tertiaryCountry,
        tertiary_postal_code: updates.tertiaryPostalCode,
        linkedin_url: updates.linkedinUrl,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update contact: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('business_card_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  }

  async deleteContactsBySessionId(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('business_card_contacts')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      throw new Error(`Failed to delete contacts: ${error.message}`);
    }
  }

  async migrateAnonymousContactsToUser(userId: string, sessionId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('business_card_contacts')
      .update({ 
        user_id: userId,
        anonymous_session_id: null 
      })
      .is('user_id', null)
      .eq('anonymous_session_id', sessionId);
    
    if (error) {
      throw new Error(`Failed to migrate anonymous contacts: ${error.message}`);
    }
    return;
  }

  private calculateCompleteness(contact: BusinessCardContact): number {
    const fields = [
      contact.firstName,
      contact.lastName,
      contact.primaryEmail,
      contact.primaryPhone,
      contact.company,
      contact.jobTitle,
      contact.primaryAddress,
      contact.primaryCity,
      contact.primaryState,
      contact.primaryCountry
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  }

  private mapToEntity(data: any): BusinessCardContact {
    return {
      id: data.id,
      userId: data.user_id ?? undefined,
      sessionId: data.session_id ?? undefined,
      anonymousSessionId: data.anonymous_session_id ?? undefined,
      firstName: data.first_name ?? undefined,
      middleName: data.middle_name ?? undefined,
      lastName: data.last_name ?? undefined,
      secondaryFirstName: data.secondary_first_name ?? undefined,
      secondaryMiddleName: data.secondary_middle_name ?? undefined,
      secondaryLastName: data.secondary_last_name ?? undefined,
      tertiaryFirstName: data.tertiary_first_name ?? undefined,
      tertiaryMiddleName: data.tertiary_middle_name ?? undefined,
      tertiaryLastName: data.tertiary_last_name ?? undefined,
      primaryEmail: data.primary_email ?? undefined,
      secondaryEmail: data.secondary_email ?? undefined,
      tertiaryEmail: data.tertiary_email ?? undefined,
      primaryPhone: data.primary_phone ?? undefined,
      primaryPhoneCountryCode: data.primary_phone_country_code ?? undefined,
      secondaryPhone: data.secondary_phone ?? undefined,
      secondaryPhoneCountryCode: data.secondary_phone_country_code ?? undefined,
      tertiaryPhone: data.tertiary_phone ?? undefined,
      tertiaryPhoneCountryCode: data.tertiary_phone_country_code ?? undefined,
      company: data.company ?? undefined,
      jobTitle: data.job_title ?? undefined,
      department: data.department ?? undefined,
      primaryWebsite: data.primary_website ?? undefined,
      secondaryWebsite: data.secondary_website ?? undefined,
      tertiaryWebsite: data.tertiary_website ?? undefined,
      primaryAddress: data.primary_address ?? undefined,
      primaryCity: data.primary_city ?? undefined,
      primaryState: data.primary_state ?? undefined,
      primaryCountry: data.primary_country ?? undefined,
      primaryPostalCode: data.primary_postal_code ?? undefined,
      secondaryAddress: data.secondary_address ?? undefined,
      secondaryCity: data.secondary_city ?? undefined,
      secondaryState: data.secondary_state ?? undefined,
      secondaryCountry: data.secondary_country ?? undefined,
      secondaryPostalCode: data.secondary_postal_code ?? undefined,
      tertiaryAddress: data.tertiary_address ?? undefined,
      tertiaryCity: data.tertiary_city ?? undefined,
      tertiaryState: data.tertiary_state ?? undefined,
      tertiaryCountry: data.tertiary_country ?? undefined,
      tertiaryPostalCode: data.tertiary_postal_code ?? undefined,
      linkedinUrl: data.linkedin_url ?? undefined,
      notes: data.notes ?? undefined,
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now())
    };
  }
}
