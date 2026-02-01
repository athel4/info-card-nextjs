'use client';
import { useEffect } from "react";
import { SEOHead } from '@/components/SEOHead';

const NotFound = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        window.location.pathname
      );
    }
  }, []);

  return (
    <>
      <SEOHead 
        title="Page Not Found - AI Business Card Scanner"
        description="The page you're looking for doesn't exist. Return to our AI Business Card Scanner to extract contacts from business cards instantly."
        keywords="404 error, page not found, business card scanner"
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
      </div>
    </>
  );
};

export default NotFound;
