import { Metadata } from 'next';
import { SignInForm } from '@/presentation/components/auth/SignInForm';

export const metadata: Metadata = {
  title: "Sign In - AI Business Card Scanner",
  description: "Sign in to your AI Business Card Scanner account to access premium features, manage your contacts, and process unlimited business cards.",
  keywords: "sign in, login, business card scanner, AI OCR, contact management",
};

export default function SignInPage() {
  return <SignInForm />;
}
