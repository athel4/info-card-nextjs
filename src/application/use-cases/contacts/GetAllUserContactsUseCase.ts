
import { BusinessCardContactRepository } from '../../../domain/repositories/BusinessCardContactRepository';
import { BusinessCardContact } from '../../../domain/entities/BusinessCardContact';

export interface ContactFilters {
  search?: string;
  dateRange?: 'week' | 'month' | 'quarter' | 'all';
  completeness?: 'high' | 'medium' | 'low' | 'all';
  company?: string;
}

export interface PaginatedContactsResult {
  contacts: BusinessCardContact[];
  totalCount: number;
  hasMore: boolean;
}

export class GetAllUserContactsUseCase {
  constructor(
    private businessCardContactRepository: BusinessCardContactRepository
  ) {}

  async execute(
    userId: string,
    page: number = 1,
    limit: number = 25,
    filters: ContactFilters = {}
  ): Promise<PaginatedContactsResult> {
    return await this.businessCardContactRepository.getAllUserContacts(
      userId,
      page,
      limit,
      filters
    );
  }
}
