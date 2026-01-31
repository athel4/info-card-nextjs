
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Package, CreditCard, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApplicationServices } from '../../contexts/ApplicationServiceContext';
import { PackageManagement } from './PackageManagement';
import { UserManagement } from './UserManagement';
import { CreditUsageStats } from './CreditUsageStats';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { adminService } = useApplicationServices();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPackages: 0,
    totalCreditsUsed: 0,
    recentActivity: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [packages, userPackages, creditStats] = await Promise.all([
        adminService.getAllPackages(),
        adminService.getAllUserPackages(),
        adminService.getCreditUsageStats()
      ]);
      
      const users = await adminService.getAllUsers();

      setStats({
        totalUsers: users.length,
        totalPackages: packages.length,
        totalCreditsUsed: creditStats.totalCreditsUsed,
        recentActivity: 0 // TODO: Implement activity tracking in AdminService
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration panel</p>
        </div>
        <Button variant="outline" onClick={signOut} className="hover:shadow-md cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPackages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCreditsUsed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="packages">Package Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="credits">Credit Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <PackageManagement onPackageUpdate={loadStats} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="credits">
          <CreditUsageStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};
