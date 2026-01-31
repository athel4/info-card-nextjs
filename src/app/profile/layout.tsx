import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Info Card Sorter",
  description: "Manage your profile, account settings, and preferences.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
