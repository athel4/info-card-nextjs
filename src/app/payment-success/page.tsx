'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCredit } from '@/presentation/contexts/CreditContext';
import { toast } from 'sonner';

const PaymentSuccessContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const { refreshCredits, isRefreshing } = useCredit();
  const [isRefreshingManually, setIsRefreshingManually] = useState(false);

  useEffect(() => {
    // Refresh credits immediately when component mounts
    if (sessionId) {
      refreshCredits().then(() => {
        toast.success('Credits have been added to your account!');
      }).catch(() => {
        toast.error('Failed to refresh credits. Please try refreshing manually.');
      });
    }

    // Auto redirect after 8 seconds (increased to give time for credit refresh)
    const timer = setTimeout(() => {
      router.push('/');
    }, 8000);

    return () => clearTimeout(timer);
  }, [sessionId, refreshCredits, router]);

  const handleManualRefresh = async () => {
    setIsRefreshingManually(true);
    try {
      await refreshCredits();
      toast.success('Credits refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh credits. Please contact support.');
    } finally {
      setIsRefreshingManually(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your payment has been processed successfully. {isRefreshing ? 'Your credits are being updated...' : 'Your credits have been added to your account!'}
          </p>
          
          {sessionId && (
            <p className="text-sm text-muted-foreground/70">
              Session ID: {sessionId}
            </p>
          )}

          {(isRefreshing || isRefreshingManually) && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating your credits...</span>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/')} 
              className="w-full"
              disabled={isRefreshing || isRefreshingManually}
            >
              Go to Dashboard
            </Button>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => router.push('/packages')} 
                variant="outline" 
                className="flex-1"
                disabled={isRefreshing || isRefreshingManually}
              >
                View Packages
              </Button>
              
              <Button 
                onClick={handleManualRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing || isRefreshingManually}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground/70">
            Redirecting to dashboard in 8 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
