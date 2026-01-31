import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Info Card Sorter",
  description: "Manage your business card contacts, view processing history, and access premium features.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
