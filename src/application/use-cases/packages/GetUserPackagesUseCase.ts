
import { UserPackageRepository } from '../../../domain/repositories/UserPackageRepository';
import { UserPackage } from '../../../domain/entities/UserPackage';

export class GetUserPackagesUseCase {
  constructor(private userPackageRepository: UserPackageRepository) {}

  async execute(userId: string): Promise<UserPackage[]> {
    return this.userPackageRepository.getUserPackages(userId);
  }
}
