import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const alternatingStyle = {
  animation: 'colorAlternate 0.75s linear infinite alternate',
};

const keyframes = `
@keyframes colorAlternate {
  0%, 25%  { color: #f800009d; text-shadow: 0 0 2px rgba(248, 0, 0, 0.6); }
  75%, 100% { color: #000000; text-shadow: 0 0 0px rgba(0, 0, 0, 0.3); }
}
`;

export const CookieConsentModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasClickedTerms, setHasClickedTerms] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAcceptedCookies = localStorage.getItem('cookieConsent');
    if (!hasAcceptedCookies) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsOpen(false);
  };

  return (
    <>
      <style>{keyframes}</style>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Welcome to Our Site</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We use cookies to enhance your experience and provide our services. 
              By continuing to use this site, you accept our use of cookies and agree to our Terms and Conditions.
            </p>
            
            <div className="flex items-center gap-2 text-sm">
              <span>Read our</span>
              <a 
                href="/tnc_with_privacy.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setHasClickedTerms(true)}
                className="underline flex items-center gap-1 font-semibold"
                style={alternatingStyle}
              >
                Terms & Conditions
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <Button 
              onClick={handleAccept}
              disabled={!hasClickedTerms}
              className="w-full cursor-pointer hover:shadow-md"
            >
              Accept & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};