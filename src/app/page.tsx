import { Metadata } from 'next';
import HomeContent from '@/presentation/components/home/HomeContent';

export const metadata: Metadata = {
  title: "AI Business Card Scanner - Organize Contacts Instantly",
  description: "Transform physical business cards into digital contacts with 99% accuracy. Export to Excel, CRM integration, and AI-powered networking.",
  keywords: "business card scanner, OCR, contact management, digital business card, AI networking",
};

export default function Page() {
  return <HomeContent />;
}
