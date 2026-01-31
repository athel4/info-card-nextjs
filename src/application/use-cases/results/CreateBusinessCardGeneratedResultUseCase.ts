
import { BusinessCardGeneratedResultRepository } from '../../../domain/repositories/BusinessCardGeneratedResultRepository';
import { BusinessCardGeneratedResult } from '../../../domain/entities/BusinessCardGeneratedResult';

export class CreateBusinessCardGeneratedResultUseCase {
  constructor(
    private businessCardGeneratedResultRepository: BusinessCardGeneratedResultRepository
  ) {}

  async execute(resultData: Omit<BusinessCardGeneratedResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessCardGeneratedResult> {
    return await this.businessCardGeneratedResultRepository.createResult(resultData);
  }
}
