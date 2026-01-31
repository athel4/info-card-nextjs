import { Metadata } from 'next';
import PackagesClient from './PackagesClient';

export const metadata: Metadata = {
  title: "Packages - AI Business Card Scanner",
  description: "Choose the perfect package for your needs. From free starter plans to enterprise solutions for high-volume business card processing.",
  keywords: "pricing, packages, subscription, business card scanner, credits",
};

export default function PackagesPage() {
  return <PackagesClient />;
}
