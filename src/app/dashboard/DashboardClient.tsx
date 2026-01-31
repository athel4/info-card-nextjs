'use client';

import React from 'react';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { UserDashboard } from '@/presentation/components/dashboard/UserDashboard';
import { AdminDashboard } from '@/presentation/components/admin/AdminDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
