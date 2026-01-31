
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, CreditCard, Upload, Settings, Clock, Package, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import Link from 'next/link';
import { useCredit } from '../../contexts/CreditContext';
import { useAuth } from '../../contexts/AuthContext';
import { ContactManagementSection } from '../../../components/contact/ContactManagementSection';

// Track if dashboard has been loaded before (persists across navigations)
let hasEverLoaded = false;

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { creditInfo, dailyCredits, isLoading, getTotalRemainingCredits, refreshCredits } = useCredit();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  // const getTimeUntilReset = (): string => {
  //   const lastReset = new Date(dailyCredits.lastReset);
  //   const nextReset = new Date(lastReset.getTime() + (dailyCredits.resetIntervalHours * 60 * 60 * 1000));
  //   const now = new Date();
  //   const timeUntilReset = Math.max(0, nextReset.getTime() - now.getTime());
    
  //   const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
  //   const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
  //   if (hours > 0) {
  //     return `${hours}h ${minutes}m`;
  //   } else {
  //     return `${minutes}m`;
  //   }
  // };
  const getTimeUntilReset = (): string => {
    const lastReset = new Date(dailyCredits.lastReset);
    const nextReset = new Date(lastReset.getTime() + (dailyCredits.resetIntervalHours * 60 * 60 * 1000));
    const now = new Date();
    const timeUntilReset = Math.max(0, nextReset.getTime() - now.getTime());

    const days = Math.floor(timeUntilReset / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilReset % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const dailyProgressPercentage = (dailyCredits.creditsUsed / dailyCredits.dailyLimit) * 100;
  const packageProgressPercentage = creditInfo ? 
    ((creditInfo.totalCredits - creditInfo.creditsRemaining) / creditInfo.totalCredits) * 100 : 0;

  // Pull-to-refresh handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCredits();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Mark as loaded once data is available
  React.useEffect(() => {
    if (!isLoading) {
      hasEverLoaded = true;
    }
  }, [isLoading]);

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
      handleRefresh();
    }
    setPullDistance(0);
    setStartY(0);
  };

  const pullSpring = useSpring({
    transform: `translateY(${pullDistance}px)`,
    config: { tension: 300, friction: 30 }
  });

  const DashboardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3, 4, 5].map(i => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-2 w-full mb-2" />
            <Skeleton className="h-5 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your business card processing and contacts</p>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Daily Credits Card */}
            <motion.div
              initial={hasEverLoaded ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={hasEverLoaded ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
            >
              <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Free Credits</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : `${dailyCredits.creditsRemaining}`} <small>remaining</small>
              </div>
              <div className="text-xs text-muted-foreground mt-1 mb-2">
                Resets in {getTimeUntilReset()}
              </div>
              <Progress value={dailyProgressPercentage} className="h-2 mb-2" />
              <Badge variant="secondary" className="text-xs">
                Free Weekly Credits
              </Badge>
            </CardContent>
          </Card>
            </motion.div>

          {/* Package Credits Card */}
          {creditInfo && (
            <motion.div
              initial={hasEverLoaded ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={hasEverLoaded ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
            >
              <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Package Credits</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : creditInfo.creditsRemaining}
                </div>
                <div className="text-xs text-muted-foreground mt-1 mb-2">
                  of {creditInfo.totalCredits} total credits
                </div>
                <Progress value={packageProgressPercentage} className="h-2 mb-2" />
                <Badge variant="secondary" className="text-xs">
                  {creditInfo.packageTier}
                </Badge>
              </CardContent>
            </Card>
            </motion.div>
          )}

          {/* Total Credits Card */}
          <motion.div
            initial={hasEverLoaded ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={hasEverLoaded ? { duration: 0 } : { duration: 0.5, delay: 0.3 }}
          >
            <Card className='h-full'>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Available Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : getTotalRemainingCredits()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Weekly + {creditInfo ? 'Package' : 'Get a package for more'}
              </div>
              {!creditInfo && (
                <Link href="/packages">
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Get Package
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
          </motion.div>

          {/* Process Cards */}
          <motion.div
            initial={hasEverLoaded ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={hasEverLoaded ? { duration: 0 } : { duration: 0.5, delay: 0.4 }}
          >
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Process Business Cards</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Upload & Extract</div>
              <div className="text-xs text-muted-foreground mt-1">
                Extract contact information from business card images
              </div>
              <Link href="/">
                <Button className="w-full mt-4 hover:shadow-md cursor-pointer" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Start Processing
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>

          {/* Package Info */}
          {creditInfo && (
            <motion.div
              initial={hasEverLoaded ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={hasEverLoaded ? { duration: 0 } : { duration: 0.5, delay: 0.5 }}
            >
              <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Package</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{creditInfo.packageName}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {creditInfo.creditsUsed} of {creditInfo.totalCredits} credits used
                </div>
                <Link href="/packages">
                  <Button variant="outline" className="w-full mt-4 hover:shadow-md cursor-pointer" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Package
                  </Button>
                </Link>
              </CardContent>
            </Card>
            </motion.div>
          )}
          {/* Community Card */}
          <motion.div
            initial={hasEverLoaded ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={hasEverLoaded ? { duration: 0 } : { duration: 0.5, delay: 0.6 }}
          >
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Beta Community</CardTitle>
                <div className="h-4 w-4 text-green-600">🚀</div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-700">+50 Credits & Surprise Perks</div>
                <div className="text-xs text-muted-foreground mt-1 mb-3">
                  Join our WhatsApp group for exclusive credits & admin-gifted surprises (e.g. free upgrades, extra tokens)...
                </div>
                <Button 
                  onClick={() => window.open('https://chat.whatsapp.com/LKbP0OIuOHL5h8m92NI6qX', '_blank')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer hover:shadow-md"
                  size="sm"
                >
                  Join Community
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          </motion.div>
        )}

        {/* Contact Management Section */}
        <ContactManagementSection />
      </div>
    </animated.div>
  );
};
