'use client';
import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentFailed: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push('/packages');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Canceled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your payment was canceled or failed. No charges were made to your account.
          </p>
          
          {sessionId && (
            <p className="text-sm text-muted-foreground/70">
              Session ID: {sessionId}
            </p>
          )}

          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/packages')} 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Packages
            </Button>
            
            <Button 
              onClick={() => router.push('/')} 
              variant="outline" 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground/70">
            Redirecting to packages in 10 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
