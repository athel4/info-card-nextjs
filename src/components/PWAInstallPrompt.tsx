
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone, Zap, Wifi, HardDrive } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useIsMobile } from '@/hooks/use-mobile';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, installApp, isIOS } = usePWA();
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  // Auto-dismiss after 30 seconds if not interacted with
  useEffect(() => {
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isDismissed]);

  // Only show on mobile devices
  if (!isMobile || (!isInstallable && !isIOS) || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const features = [
    { icon: Zap, text: 'Faster loading' },
    { icon: Wifi, text: 'Works offline' },
    { icon: HardDrive, text: 'Saves storage' },
  ];

  return (
    <Card className={`fixed ${isMobile ? 'bottom-20 left-4 right-4' : 'bottom-4 right-4 w-80'} z-50 shadow-lg border-primary animate-in slide-in-from-bottom-2 duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Install Spark Connect</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isIOS ? 'Tap share, then "Add to Home Screen"' : (showFeatures ? 'Enhanced mobile experience' : 'Get quick access and work offline')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer hover:shadow-md"
            style={{ minWidth: '32px', minHeight: '32px' }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {showFeatures && (
          <div className="flex gap-4 mt-3 mb-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  <span>{feature.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {isIOS && (
          <div className="mt-3 text-xs text-muted-foreground">
            On iPhone: tap the Share button, then "Add to Home Screen".
          </div>
        )}
        
        <div className={`flex gap-2 mt-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          {isIOS ? (
            <>
              <Button
                onClick={handleDismiss}
                size={isMobile ? 'default' : 'sm'}
                className={isMobile ? 'h-11' : ''}
              >
                Got it
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size={isMobile ? 'default' : 'sm'}
                className={isMobile ? 'h-11' : ''}
              >
                Maybe Later
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleInstall}
                size={isMobile ? 'default' : 'sm'}
                className={`${isMobile ? 'h-11' : ''} flex-1 hover:shadow-md cursor-pointer`}
                onMouseEnter={() => setShowFeatures(true)}
                onMouseLeave={() => setShowFeatures(false)}
              >
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size={isMobile ? 'default' : 'sm'}
                className={isMobile ? 'h-11' : ''}
              >
                Maybe Later
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
