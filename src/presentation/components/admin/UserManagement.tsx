'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield } from 'lucide-react';
import { useApplicationServices } from '../../contexts/ApplicationServiceContext';
import { User as UserEntity } from '../../../domain/entities/User';
import { UserPackage } from '../../../domain/entities/UserPackage';

export const UserManagement: React.FC = () => {
  const { adminService } = useApplicationServices();
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const [userList, packageList] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllUserPackages()
      ]);
      setUsers(userList);
      setUserPackages(packageList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'end_user' | 'admin') => {
    try {
      // TODO: Add updateUser method to AdminApplicationService
      // await adminService.updateUser(userId, { role: newRole });
      console.log('User role update not implemented yet');
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const getUserPackage = (userId: string) => {
    return userPackages.find(up => up.userId === userId && up.isActive);
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map(user => {
            const userPackage = getUserPackage(user.id);
            return (
              <div key={user.id} className="flex justify-between items-center p-4 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{user.fullName || user.email}</h3>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? (
                        <>
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </>
                      ) : (
                        'User'
                      )}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {userPackage && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {userPackage.package?.name} • {userPackage.creditsRemaining} credits remaining
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Joined: {user.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <Select
                      value={user.role}
                      onValueChange={(role: 'end_user' | 'admin') => updateUserRole(user.id, role)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="end_user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
