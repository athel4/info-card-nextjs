import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: "Dashboard - AI Business Card Scanner",
  description: "Manage your business card contacts, view processing history, and access premium features. Your personal AI-powered networking hub.",
  keywords: "dashboard, contact management, business card history, networking hub",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
