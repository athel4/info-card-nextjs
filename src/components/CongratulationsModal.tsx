import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            🎉 Congratulations, you're all set!
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Your onboarding is complete, and 50 free credits have been added to your account.
          </p>
          <p className="text-gray-600">
            🌟 Explore at your own pace or dive right in to unlock powerful features!
          </p>
          <Button onClick={onClose} className="w-full cursor-pointer hover:shadow-md">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};