'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Crown, Building, RefreshCw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useCredit } from '@/presentation/contexts/CreditContext';
import { useApplicationServices } from '@/presentation/contexts/ApplicationServiceContext';
import { Package } from '@/domain/entities/Package';
import { useToast } from '@/hooks/use-toast';
import { DowngradeBlockedModal } from '@/components/DowngradeBlockedModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export default function PackagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { creditInfo } = useCredit();
  const { paymentService } = useApplicationServices();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [showDowngradeBlockedModal, setShowDowngradeBlockedModal] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const fetchPackages = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const allPackages = await paymentService.getActivePackages();
      setPackages(allPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setIsLoading(false);
      if (isRefresh) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY > 0 && window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, Math.min(100, currentY - startY));
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      fetchPackages(true);
    }
    setPullDistance(0);
    setStartY(0);
  };

  const pullSpring = useSpring({
    transform: `translateY(${pullDistance}px)`,
    config: { tension: 300, friction: 30 }
  });

  const getPackageIcon = (tier: string) => {
    switch (tier) {
      case 'free': return <Zap className="h-6 w-6 text-blue-500" />;
      case 'basic': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'premium': return <Crown className="h-6 w-6 text-purple-500" />;
      case 'enterprise': return <Building className="h-6 w-6 text-gray-700" />;
      default: return <Zap className="h-6 w-6 text-blue-500" />;
    }
  };

  const isCurrentPackage = (tier: string) => {
    return user && creditInfo?.packageTier === tier;
  };

  const handleSubscribe = async (pkg: Package) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a package.",
      });
      router.push('/signin');
      return;
    }

    if (isCurrentPackage(pkg.tier)) {
      toast({
        title: "Already Subscribed",
        description: "You are already subscribed to this package.",
      });
      return;
    }

    // Check if trying to downgrade
    const tiers = ['free', 'basic', 'premium', 'enterprise'];
    const currentTierIndex = tiers.indexOf(creditInfo?.packageTier || 'free');
    const newTierIndex = tiers.indexOf(pkg.tier);

    if (newTierIndex < currentTierIndex) {
      setShowDowngradeBlockedModal(true);
      return;
    }

    // For beta, block payments
    if (pkg.priceMonthly > 0) {
      setShowBetaModal(true);
      return;
    }

    setProcessingPayment(pkg.id);
    try {
      // Simulate payment processing
      setTimeout(() => {
        toast({
          title: "Subscription Successful",
          description: `You have successfully subscribed to ${pkg.name}.`,
        });
        setProcessingPayment(null);
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setProcessingPayment(null);
    }
  };

  return (
    <div 
      className="container mx-auto px-4 py-8 pb-24 safe-area-pb"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <animated.div style={pullSpring}>
        {isRefreshing && (
          <div className="flex justify-center mb-4">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect package for your business card scanning needs. 
            Upgrade anytime as your network grows.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-[500px] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`relative h-full flex flex-col ${
                  pkg.isPopular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'
                }`}>
                  {pkg.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold shadow-sm">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className="mx-auto bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                      {getPackageIcon(pkg.tier)}
                    </div>
                    <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                    <div className="mt-4 flex items-baseline justify-center text-gray-900">
                      <span className="text-5xl font-extrabold tracking-tight">
                        ${pkg.priceMonthly}
                      </span>
                      <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
                    </div>
                    <CardDescription className="mt-4 text-gray-500">
                      {pkg.planDescription}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-4">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-8">
                    <Button 
                      className={`w-full h-12 text-lg font-semibold ${
                        isCurrentPackage(pkg.tier) 
                          ? 'bg-green-500 hover:bg-green-600 text-white cursor-default'
                          : pkg.isPopular 
                            ? 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all cursor-pointer'
                            : 'hover:shadow-md cursor-pointer'
                      }`}
                      variant={isCurrentPackage(pkg.tier) ? 'secondary' : (pkg.isPopular ? 'default' : 'outline')}
                      onClick={() => handleSubscribe(pkg)}
                      disabled={isCurrentPackage(pkg.tier) || processingPayment === pkg.id}
                    >
                      {processingPayment === pkg.id ? (
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      ) : null}
                      {isCurrentPackage(pkg.tier) ? 'Current Plan' : 'Subscribe Now'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-8 w-8 text-primary mr-3" />
            <h3 className="text-2xl font-bold">Need a Custom Solution?</h3>
          </div>
          <p className="text-gray-600 mb-6 text-lg">
            Looking for enterprise-grade features, custom integrations, or volume discounts? 
            Contact our sales team for a tailored package.
          </p>
          <Button variant="outline" size="lg" className="font-semibold hover:shadow-md cursor-pointer" asChild>
            <Link href="mailto:sales@infocardsorter.com">
              Contact Sales
            </Link>
          </Button>
        </div>
      </animated.div>

      <DowngradeBlockedModal 
        isOpen={showDowngradeBlockedModal} 
        onClose={() => setShowDowngradeBlockedModal(false)} 
      />

      <Dialog open={showBetaModal} onOpenChange={setShowBetaModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beta Access</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              We are currently in beta. All paid features are available for free for a limited time!
              You can subscribe to the Free plan to get started.
            </p>
            <Button onClick={() => setShowBetaModal(false)} className="w-full cursor-pointer hover:shadow-md">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
