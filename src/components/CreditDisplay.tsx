import React from 'react';
import { Coins, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserCreditInfo } from '../domain/entities/UserCreditInfo';

interface CreditDisplayProps {
  creditInfo: UserCreditInfo;
  estimatedCost?: number;
  showEstimate?: boolean;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  creditInfo, 
  estimatedCost = 0, 
  showEstimate = false 
}) => {
  const progressPercentage = (creditInfo.creditsUsed / creditInfo.totalCredits) * 100;
  const remainingAfterOperation = creditInfo.creditsRemaining - estimatedCost;
  const canAfford = remainingAfterOperation >= 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
            <Coins className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Credit Balance</h3>
            <p className="text-sm text-gray-600">{creditInfo.packageName}</p>
          </div>
        </div>
        <Badge variant={creditInfo.packageTier === 'free' ? 'secondary' : 'default'}>
          {creditInfo.packageTier.charAt(0).toUpperCase() + creditInfo.packageTier.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Credits Used</span>
          <span className="font-medium">
            {creditInfo.creditsUsed} / {creditInfo.totalCredits}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Remaining</span>
          <span className="font-semibold text-blue-600">
            {creditInfo.creditsRemaining} credits
          </span>
        </div>
      </div>

      {showEstimate && estimatedCost > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canAfford ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                Estimated Cost: {estimatedCost} credits
              </span>
            </div>
            <span className={`text-sm font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
              After: {remainingAfterOperation} credits
            </span>
          </div>
          {!canAfford && (
            <p className="text-xs text-red-600 mt-1">
              Insufficient credits. Please upgrade your plan.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;
