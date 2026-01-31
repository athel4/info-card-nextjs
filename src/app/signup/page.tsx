import { Metadata } from 'next';
import { SignUpForm } from '@/presentation/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: "Sign Up - AI Business Card Scanner",
  description: "Create your free AI Business Card Scanner account. Get 10 free credits to start extracting contacts from business cards with 99% accuracy.",
  keywords: "sign up, register, free account, business card scanner, AI OCR",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
