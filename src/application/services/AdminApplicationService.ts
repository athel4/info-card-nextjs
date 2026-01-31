import { UserRepository } from '../../domain/repositories/UserRepository';
import { PackageRepository } from '../../domain/repositories/PackageRepository';
import { UserPackageRepository } from '../../domain/repositories/UserPackageRepository';
import { CreditUsageRepository } from '../../domain/repositories/CreditUsageRepository';
import { User } from '../../domain/entities/User';
import { Package } from '../../domain/entities/Package';
import { UserPackage } from '../../domain/entities/UserPackage';

export class AdminApplicationService {
  constructor(
    private userRepository: UserRepository,
    private packageRepository: PackageRepository,
    private userPackageRepository: UserPackageRepository,
    private creditUsageRepository: CreditUsageRepository
  ) {}

  async getAllUsers(): Promise<User[]> {
    // This method would need to be added to UserRepository
    // For now, return empty array
    return [];
  }

  async getAllPackages(): Promise<Package[]> {
    return this.packageRepository.getAllPackages();
  }

  async createPackage(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    return this.packageRepository.createPackage(packageData);
  }

  async updatePackage(id: string, updates: Partial<Package>): Promise<Package> {
    return this.packageRepository.updatePackage(id, updates);
  }

  async deletePackage(id: string): Promise<void> {
    return this.packageRepository.deletePackage(id);
  }

  async getAllUserPackages(): Promise<UserPackage[]> {
    return this.userPackageRepository.getAllUserPackages();
  }

  async getCreditUsageStats() {
    // This would need specific methods in CreditUsageRepository
    // For now, return empty stats
    return {
      totalCreditsUsed: 0,
      totalUsers: 0,
      averageCreditsPerUser: 0
    };
  }
}