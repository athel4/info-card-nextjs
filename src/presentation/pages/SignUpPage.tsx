
import React from 'react';
import { SignUpForm } from '../components/auth/SignUpForm';
import { SEOHead } from '@/components/SEOHead';

export const SignUpPage: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Sign Up - AI Business Card Scanner"
        description="Create your free AI Business Card Scanner account. Get 10 free credits to start extracting contacts from business cards with 99% accuracy."
        keywords="sign up, register, free account, business card scanner, AI OCR"
      />
      <SignUpForm />
    </>
  );
};
