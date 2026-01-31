'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useApplicationServices } from '../../contexts/ApplicationServiceContext';
import { Package } from '../../../domain/entities/Package';

interface PackageManagementProps {
  onPackageUpdate: () => void;
}

export const PackageManagement: React.FC<PackageManagementProps> = ({ onPackageUpdate }) => {
  const { adminService } = useApplicationServices();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tier: 'free' as 'free' | 'basic' | 'premium' | 'enterprise',
    creditLimit: 0,
    priceMonthly: 0,
    features: '',
    isActive: true
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const packageList = await adminService.getAllPackages();
      setPackages(packageList);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const packageData = {
        ...formData,
        features: formData.features.split('\n').filter(f => f.trim())
      };

      if (editingPackage) {
        await adminService.updatePackage(editingPackage.id, packageData);
      } else {
        await adminService.createPackage(packageData);
      }

      await loadPackages();
      onPackageUpdate();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      tier: pkg.tier,
      creditLimit: pkg.creditLimit,
      priceMonthly: pkg.priceMonthly,
      features: pkg.features.join('\n'),
      isActive: pkg.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await adminService.deletePackage(id);
        await loadPackages();
        onPackageUpdate();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      tier: 'free',
      creditLimit: 0,
      priceMonthly: 0,
      features: '',
      isActive: true
    });
  };

  if (isLoading) {
    return <div>Loading packages...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Package Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingPackage ? 'Edit Package' : 'Create Package'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value: 'free' | 'basic' | 'premium' | 'enterprise') => setFormData({ ...formData, tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="creditLimit">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priceMonthly">Monthly Price</Label>
                  <Input
                    id="priceMonthly"
                    type="number"
                    step="0.01"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="features">Features (one per line)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {packages.map(pkg => (
            <div key={pkg.id} className="flex justify-between items-center p-4 border rounded">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <Badge variant="secondary" className="capitalize">
                    {pkg.tier}
                  </Badge>
                  {!pkg.isActive && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {pkg.creditLimit} credits • ${pkg.priceMonthly}/month
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pkg.features.slice(0, 2).join(' • ')}
                  {pkg.features.length > 2 && ` • +${pkg.features.length - 2} more`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(pkg.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
