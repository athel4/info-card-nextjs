
import React from 'react';
import { AlertCircle, Clock, User, CreditCard, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useCredit } from '@/presentation/contexts/CreditContext';

interface UsageLimitsProps {
  cardCount: number;
  estimatedCost:number;
  generationRequested?: boolean;
}

export const UsageLimits: React.FC<UsageLimitsProps> = ({ cardCount,estimatedCost, generationRequested = false }) => {
  const { user } = useAuth();
  const { 
    dailyCredits, 
    creditInfo, 
    canProcess, 
    getTotalRemainingCredits, 
    isLoading,
    isRefreshing
  } = useCredit();

  // Show loading UI if initially loading or refreshing credits
  if (isLoading || isRefreshing) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                {isRefreshing ? 'Refreshing credit balance...' : 'Loading credit information...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate estimated cost: N cards + 1 for generation (if requested)
  const baseCredits = cardCount;
  const generationCredits = generationRequested ? 1 : 0;
  //const estimatedCost = baseCredits + generationCredits;
  
  const totalRemaining = getTotalRemainingCredits();
  const dailyRemaining = dailyCredits.creditsRemaining;
  const packageRemaining = creditInfo?.creditsRemaining || 0;

  // Check if selected cards exceed what they can process
  if (!canProcess(estimatedCost)) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">
                Insufficient Credits
              </p>
              <p className="text-sm text-orange-600">
                You need {estimatedCost} credits ({baseCredits} cards{generationCredits > 0 ? ` + ${generationCredits} generation` : ''}) but only have {totalRemaining} available.
              </p>
              <div className="mt-2 text-xs text-orange-500">
                Daily: {dailyRemaining}/{dailyCredits.dailyLimit} credits
                {user && creditInfo && ` • Package: ${packageRemaining} credits`}
              </div>
            </div>
            <Link href={user? "/packages":"/signup"}>
              <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100 hover:shadow-md cursor-pointer">
                Upgrade
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if they've reached their daily limit and have no package credits
  if (dailyRemaining === 0 && (!user || packageRemaining === 0)) {
    const timeUntilReset = dailyCredits.resetIntervalHours * 60 * 60 * 1000 - (Date.now() - dailyCredits.lastReset.getTime());
    const hoursUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60));
    
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Daily Credits Exhausted
              </p>
              <p className="text-sm text-red-600">
                You've used all {dailyCredits.dailyLimit} daily credits today.
              </p>
              <div className="mt-2 text-xs text-red-500">
                {hoursUntilReset > 0 ? `Resets in ${hoursUntilReset} hours` : 'Resetting soon'}
              </div>
            </div>
            <Link href={user? "/packages":"/signup"}>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white hover:shadow-md cursor-pointer">
                Get More Credits
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show current status with progress indicator
  const dailyProgressPercentage = (dailyCredits.creditsUsed / dailyCredits.dailyLimit) * 100;
  const isNearDailyLimit = dailyProgressPercentage > 80;

  return (
    <Card className={`border-blue-200 ${isNearDailyLimit ? 'bg-amber-50' : 'bg-blue-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {cardCount > 0 && canProcess(estimatedCost) ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <User className={`h-5 w-5 ${isNearDailyLimit ? 'text-amber-600' : 'text-blue-600'}`} />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${isNearDailyLimit ? 'text-amber-800' : 'text-blue-800'}`}>
              {cardCount > 0 && canProcess(estimatedCost) 
                ? `Ready to process ${cardCount} cards (${estimatedCost} credits${generationCredits > 0 ? ` = ${baseCredits} + ${estimatedCost-baseCredits} Message` : ''})` 
                : `${totalRemaining} credits available`
              }
            </p>
            <div className={`text-sm ${isNearDailyLimit ? 'text-amber-600' : 'text-blue-600'}`}>
              <span>Weekly: {dailyCredits.creditsUsed}/{dailyCredits.dailyLimit} credits used</span>
              {user && creditInfo && (
                <span> • Package: {packageRemaining} credits</span>
              )}
            </div>
            
            {/* Daily progress bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${isNearDailyLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(dailyProgressPercentage, 100)}%` }}
              />
            </div>
          </div>
          {!user && (
            <Link href={user? "/packages":"/signup"}>
              <Button size="sm" variant="outline" className={`${isNearDailyLimit ? 'border-amber-300 text-amber-700 hover:bg-amber-100' : 'border-blue-300 text-blue-700 hover:bg-blue-100'} cursor-pointer hover:shadow-md`}>
                <CreditCard className="h-4 w-4 mr-1" />
                Get More
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
