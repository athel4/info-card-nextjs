
import { Package } from '../entities/Package';

export interface PackageRepository {
  getAllPackages(): Promise<Package[]>;
  getActivePackages(): Promise<Package[]>;
  getPackageById(id: string): Promise<Package | null>;
  createPackage(data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package>;
  updatePackage(id: string, data: Partial<Package>): Promise<Package>;
  deletePackage(id: string): Promise<void>;
  getSubscriptionPackages(): Promise<Package[]>;
  getOneTimePackages(): Promise<Package[]>;
}
