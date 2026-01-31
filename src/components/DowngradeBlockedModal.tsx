'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle,Clock,Lock,BookOpen,Leaf } from 'lucide-react';
import { useAuth } from '../presentation/contexts/AuthContext';
import { useCredit } from '../presentation/contexts/CreditContext';

interface DowngradeBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPackageName?: string;
}

export const DowngradeBlockedModal: React.FC<DowngradeBlockedModalProps> = ({ isOpen, onClose, targetPackageName }) => {
  const { user } = useAuth();
  const { creditInfo } = useCredit();
  
  // Calculate eligibility date (4 months from user creation)
  const eligibilityDate = user?.createdAt ? new Date(new Date(user.createdAt).getTime() + (4 * 30 * 24 * 60 * 60 * 1000)) : null;
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!eligibilityDate) return '4 months';
    
    const now = new Date();
    const diffMs = eligibilityDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Now eligible';
    
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    
    if (diffMonths > 0) {
      return remainingDays > 0 ? `${diffMonths} month${diffMonths > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };
  
  const formatEligibilityDate = () => {
    if (!eligibilityDate) return 'Date pending';
    return eligibilityDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const handleContactSupport = () => {
    const body = `User Email: ${user?.email || 'N/A'}%0D%0ACurrent Package: ${creditInfo?.packageName || 'N/A'}%0D%0ATarget Package: ${targetPackageName || '[Please specify]'}%0D%0A%0D%0ARequest Details:%0D%0A`;
    window.open(`mailto:info@vebmy.com?subject=Downgrade Request&body=${body}`, '_self');
    onClose();
  };
  const handleNotifyMe = () => {
    const body = `User Email: ${user?.email || 'N/A'}%0D%0ACurrent Package: ${creditInfo?.packageName || 'N/A'}%0D%0ATarget Package: ${targetPackageName || '[Please specify]'}%0D%0A%0D%0ARequest Details:%0D%0A`;
    window.open(`mailto:info@vebmy.com?subject=Downgrade Eligibility Notification&body=${body}`, '_self');
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
        <Lock className="h-5 w-5 text-red-500" />
        Downgrade Locked — Eligibility Coming Soon
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {/* Info Box */}
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <p className="text-sm text-red-800 font-medium">
          Downgrades are locked for the first <strong>4 months</strong> to protect your account and benefits.
        </p>
        <p className="mt-1 text-sm text-gray-700">
          Eligible in <strong>{getTimeRemaining()}</strong> • <strong>{formatEligibilityDate()}</strong>
        </p>
      </div>

      {/* Supportive Messaging */}
      <p className="text-sm text-gray-600">
        Want to plan ahead? We can remind you when you're eligible, or you can request an early review
        if you believe this restriction doesn’t fit your situation.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1 cursor-pointer hover:shadow-md">
          Close
        </Button>
        <Button
          onClick={handleNotifyMe}
          variant="outline"
          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 cursor-pointer hover:shadow-md"
        >
          Notify Me
        </Button>
        <Button
          onClick={handleContactSupport}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer hover:shadow-md"
        >
          Request Early Review
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
  );
};