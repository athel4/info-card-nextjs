
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Crown, Building, RefreshCw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useCredit } from '../contexts/CreditContext';
import { useApplicationServices } from '../contexts/ApplicationServiceContext';
import { Package } from '../../domain/entities/Package';
import { useToast } from '@/hooks/use-toast';
import { DowngradeBlockedModal } from '@/components/DowngradeBlockedModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '../../integrations/supabase/client';
//import { SEOKeywordProcessor } from '@/utils/seoKeywordProcessor';

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export const PackagesPage: React.FC = () => {
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
      //await  SEOKeywordProcessor.processKeywords();
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

  const handlePurchase = async (pkg: Package) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase a package.",
        variant: "destructive"
      });
      return;
    }

    if (isCurrentPackage(pkg.tier)) {
      toast({
        title: "Package Active",
        description: "This is your current package.",
      });
      return;
    }

    setProcessingPayment(pkg.id);
    
    try {
      // Check if user is on free plan or paid plan based on current package credit limit
      const currentPackage = creditInfo?.packageId ? packages.find(p => p.id === creditInfo.packageId) : null;
      const isCurrentlyOnFreePlan = !creditInfo || !currentPackage || currentPackage.creditLimit === 0;
      const isTargetPaidPlan = pkg.creditLimit > 0;
      
      if (isCurrentlyOnFreePlan && isTargetPaidPlan) {
        // Free to paid: Use regular Stripe checkout
        await paymentService.validatePackageEligibility({
          userId: user.id,
          packageId: pkg.id,
          userEmail: user.email || ''
        });

        const encodedReference = encodeUUIDsToBase36(user.id, pkg.id);
        const paymentUrl = pkg.stripePaymentUrl;
        window.open(`${paymentUrl}?client_reference_id=${encodedReference}`, '_blank');
      } else {
        // Paid to paid: Use subscription management
        const response = await supabase.functions.invoke('manage-subscription', {
                          body: { targetPackageId: pkg.id }
                        });
        
        if (response.error || !response.data?.success) {
          const errorMessage = response.data?.error || response.error?.message || 'Unknown error';
          throw new Error(errorMessage);
        }
        
        toast({
          title: "Subscription Updated",
          description: `Successfully ${response.data.changeType}d to ${pkg.name}`,
        });
        
        // Refresh credit info
        window.location.reload();
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      
      if (error instanceof Error && error.message === "DOWNGRADE_BLOCKED_4_MONTHS") {
        setShowDowngradeBlockedModal(true);
      } else {
        toast({
          title: "Payment Error",
          description: error instanceof Error ? error.message : "Failed to initiate payment. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setProcessingPayment(null);
    }
  };  
function encodeUUIDsToBase36(uuid1: any, uuid2: any) {
  // Step 1: Combine UUIDs with a delimiter
  const combined = `${uuid1}^!^${uuid2}`;

  // Step 2: Convert string to UTF-8 bytes
  const encoder = new TextEncoder();
  const bytes = encoder.encode(combined);

  // Step 3: Convert bytes to hex string
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Step 4: Convert hex string to BigInt
  const bigIntValue = BigInt('0x' + hex);

  // Step 5: Convert BigInt to Base36 (final compact format)
  return bigIntValue.toString(36).toUpperCase();
}

  const getButtonProps = (pkg: Package) => {
    if (!user) {
      // Anonymous user - all packages lead to signup
      return {
        text: pkg.creditLimit === 0 ? 'Get Started Free' : 'Get Started',
        variant: (pkg.tier === 'premium' ? 'default' : 'outline') as ButtonVariant,
        disabled: !!processingPayment,
        to: `/signup?package=${pkg.tier}`,
        onClick: undefined
      };
    }

    // Authenticated user
    if (isCurrentPackage(pkg.tier)) {
      return {
        text: 'Current Plan',
        variant: 'outline' as ButtonVariant,
        disabled: true,
        to: null,
        onClick: undefined
      };
    }

    // Determine upgrade/downgrade based on credit limits
    const currentCreditLimit = creditInfo?.creditLimit || 0;
    const isUpgrade = pkg.creditLimit > currentCreditLimit;
    const buttonText = processingPayment === pkg.id 
      ? 'Processing...' 
      : isUpgrade 
        ? 'Upgrade' 
        : 'Downgrade';

    return {
      text: buttonText,
      variant: 'default' as ButtonVariant,
      disabled: !!processingPayment,
      to: null,
      //onClick: () => handlePurchase(pkg)
      onClick: () => setShowBetaModal(true)
    };
  };
////onClick: () => handlePurchase(pkg)
  const PackageSkeleton = () => (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="mt-4">
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <PackageSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Pricing Plans - AI Business Card Scanner"
        description="Choose the perfect plan for your business card processing needs. Free plan available. Extract contacts with AI, generate messages, and streamline networking."
        keywords="business card scanner pricing, AI OCR plans, contact extraction pricing, business card app cost"
        breadcrumbs={[
          {name: "Home", url: "/"},
          {name: "Pricing", url: "/packages"}
        ]}
        products={packages.map(pkg => ({
          name: pkg.name,
          price: pkg.priceMonthly,
          currency: "MYR"
        }))}
      />
      <animated.div 
        className="min-h-screen bg-gray-50 py-8"
        style={pullSpring}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white rounded-full p-3 shadow-lg">
              <RefreshCw className={`h-5 w-5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          {user ? (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan for your business card processing needs.
              {creditInfo && (
                <span className="block mt-2 text-sm">
                  Currently on <strong>{creditInfo.packageName}</strong> plan with{' '}
                  <strong>{creditInfo.creditsRemaining}</strong> package credits remaining.
                </span>
              )}
            </p>
          ) : (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with our AI-powered business card processing. 
              <span className="block mt-2 text-sm">
                Sign up for any plan and start extracting contact information from business cards instantly.
              </span>
            </p>
          )}
        </div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {packages.map((pkg, index) => {
            const buttonProps = getButtonProps(pkg);
            const isPremium = pkg.tier === 'premium';
            
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`flex flex-col relative ${
                  isCurrentPackage(pkg.tier) 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : isPremium
                    ? 'ring-2 ring-purple-200 shadow-lg'
                    : 'hover:shadow-lg transition-shadow'
                }`}>
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPackageIcon(pkg.tier)}
                      <div>
                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {pkg.tier} Plan
                        </CardDescription>
                      </div>
                    </div>
                    {isCurrentPackage(pkg.tier) && (
                      <Badge variant="default">Current</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      RM {pkg.priceMonthly}
                      <span className="text-sm font-normal text-gray-500">/month</span>
                    </div>
                    <div className={`text-sm text-gray-600 mt-1 ${pkg.creditLimit>0?null:"invisible"}`}>
                      {pkg.creditLimit} credits included
                    </div>
                    <div className={`text-sm text-gray-600 mt-3`}>
                      {pkg.planDescription}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='h-full'>
                  <TooltipProvider>
                    <div className="space-y-3">
                      {pkg.features.map((feature, index) => {
                        // Check if this feature contains PERSONAFY with tooltip
                        if (feature.toLowerCase().includes('personafy')) {
                          return (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <span>Includes PERSONAFY</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-56">
                                      <p>Behavior-tuned AI messages for better closing..</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                {feature.toLowerCase().includes('coming soon') && (
                                  <div className="text-xs text-gray-500 mt-1">(Coming soon)</div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        if (feature.toLowerCase().includes('credit rollover')) {
                          return (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <span>Credit rollover</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-56">
                                      <p>Paid credit comes with 1 year validity</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                {feature.toLowerCase().includes('coming soon') && (
                                  <div className="text-xs text-gray-500 mt-1">(Coming soon)</div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        
                        // Regular feature without tooltip
                        return (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600"
                              dangerouslySetInnerHTML={{ __html: feature }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                  
                </CardContent>
                <CardFooter className='block'>
                  {pkg.creditLimit>0?
                  buttonProps.to ? (
                    <Link href={buttonProps.to} className="block mt-6">
                      <Button 
                        className="w-full hover:shadow-md cursor-pointer" 
                        variant={buttonProps.variant}
                      >
                        {buttonProps.text}
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full mt-6 hover:shadow-md cursor-pointer" 
                      variant={buttonProps.variant}
                      disabled={buttonProps.disabled}
                      onClick={buttonProps.onClick}
                    >
                      {buttonProps.text}
                    </Button>
                  ):""}

                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
               <span>*Weekly credits expire at the end of each cycle.</span>
   
        <DowngradeBlockedModal 
          isOpen={showDowngradeBlockedModal}
          onClose={() => setShowDowngradeBlockedModal(false)}
          targetPackageName={packages.find(p => p.id === processingPayment)?.name}
        />
        
        <Dialog open={showBetaModal} onOpenChange={setShowBetaModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">🎉 You're In! Now…</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-center">
              <div className="text-lg font-semibold">🚀 Spark a Lead. Close with Confidence.</div>
              <div className="text-base">🎁 Claim 50 Free Credits — just join our private beta community.</div>
              <div className="text-sm text-gray-600">Be the first to try Spark before the crowd catches up.</div>
              <div className="space-y-2 text-sm">
                <div>⚡ Built for speed</div>
                <div>🧠 Made for doers, not hand-holders</div>
              </div>
              <Button 
                onClick={() => window.open('https://chat.whatsapp.com/LKbP0OIuOHL5h8m92NI6qX', '_blank')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                👉 Join the WhatsApp Beta Group
              </Button>
              <div className="text-sm">
                <div className="font-semibold mb-2">✅ Already in? Unlock even more credits:</div>
                <div className="space-y-1 text-xs">
                  <div>➕ +50 for referring a friend</div>
                  <div>📢 +30 for sharing us on social media</div>
                  <div>💡 +20 for helpful feedback</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </animated.div>
    </>
  );
};
