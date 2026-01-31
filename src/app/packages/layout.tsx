import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Packages - Info Card Sorter",
  description: "Choose the perfect package for your business card scanning needs.",
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
