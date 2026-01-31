
import React from 'react';
import { SignInForm } from '../components/auth/SignInForm';
import { SEOHead } from '@/components/SEOHead';

export const SignInPage: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Sign In - AI Business Card Scanner"
        description="Sign in to your AI Business Card Scanner account to access premium features, manage your contacts, and process unlimited business cards."
        keywords="sign in, login, business card scanner, AI OCR, contact management"
      />
      <SignInForm />
    </>
  );
};
