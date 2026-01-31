'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AnonymousLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnonymousLimitModal: React.FC<AnonymousLimitModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/signup');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            🎉 You're Almost Out of Credits!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Attention-Grabbing Message */}
          <p className="text-center text-muted-foreground font-medium">
            🚀 Don’t lose your momentum — keep scanning and winning by upgrading your access now.
          </p>

          {/* Key Benefits List */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                Save and track all your analysis history
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                Get extra free credits every week
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                Unlock advanced features like <strong>smart messaging</strong><br/>(coming soon)
              </span>
            </div>
          </div>

          {/* Call to Action Button */}
          <Button onClick={handleSignUp} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg cursor-pointer hover:shadow-md" size="lg">
            Sign Up Free & Keep Going →
          </Button>

          {/* Subtle Urgency Note */}
          <p className="text-xs text-center text-gray-500 mt-2">
            ⚡ Stay ahead — don’t let opportunities slip away.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
