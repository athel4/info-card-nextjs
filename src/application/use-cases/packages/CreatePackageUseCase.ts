
import { PackageRepository } from '../../../domain/repositories/PackageRepository';
import { Package } from '../../../domain/entities/Package';

export class CreatePackageUseCase {
  constructor(private packageRepository: PackageRepository) {}

  async execute(data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    return this.packageRepository.createPackage(data);
  }
}
