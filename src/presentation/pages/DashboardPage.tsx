
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserDashboard } from '../components/dashboard/UserDashboard';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { SEOHead } from '@/components/SEOHead';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return (
      <>
        <SEOHead 
          title="Admin Dashboard - AI Business Card Scanner"
          description="Admin dashboard for managing AI Business Card Scanner. Monitor users, packages, and system performance."
          keywords="admin dashboard, business card scanner admin, user management"
        />
        <AdminDashboard />
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Dashboard - AI Business Card Scanner"
        description="Manage your business card contacts, view processing history, and access premium features. Your personal AI-powered networking hub."
        keywords="dashboard, contact management, business card history, networking hub"
        breadcrumbs={[
          {name: "Home", url: "/"},
          {name: "Dashboard", url: "/dashboard"}
        ]}
      />
      <UserDashboard />
    </>
  );
};
