'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Settings, Coins, Download, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../../presentation/contexts/AuthContext';
import { useCredit } from '../../presentation/contexts/CreditContext';
import { usePWA } from '../../hooks/usePWA';
import { useIsMobile } from '../../hooks/use-mobile';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, isLoading } = useAuth();
  const { creditInfo, getTotalRemainingCredits } = useCredit();
  const { isInstallable, installApp } = usePWA();
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleInstallApp = async () => {
    const installed = await installApp();
    if (installed) {
      setIsMenuOpen(false);
    }
  };

  const renderDesktopAuth = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      );
    }

    if (user) {
      return (
        <>
          {/* Credit Display for Authenticated Users */}
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
            <Coins className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {getTotalRemainingCredits()} credits
            </span>
          </div>
          
          <Button asChild variant="ghost" size="sm" className="cursor-pointer hover:shadow-md">
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>
        
          <Button asChild variant="ghost" size="sm" title="FAQ" className="cursor-pointer hover:shadow-md">
            <Link href="/faq">
              <HelpCircle className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" title="Profile" className="cursor-pointer hover:shadow-md">
            <Link href="/profile">
              <User className="h-4 w-4" /><span className="text-sm text-gray-700">
              {user.fullName || user.email}
            </span>
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 cursor-pointer hover:shadow-md"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        {/* Anonymous Credit Display */}
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
          <Coins className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {getTotalRemainingCredits()} free credits
          </span>
        </div>
        
        <Link href="/faq">
          <Button variant="ghost" size="sm" title="FAQ" className="cursor-pointer hover:shadow-md">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/packages">
          <Button variant="ghost" size="sm" className="cursor-pointer hover:shadow-md">
            Pricing
          </Button>
        </Link>
        <Link href="/signin">
          <Button variant="ghost" size="sm" className="cursor-pointer hover:shadow-md">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" className="cursor-pointer hover:shadow-md">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  };

  const renderMobileAuth = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    if (user) {
      return (
        <>
          {/* Mobile Credit Display */}
          <div className="flex items-center justify-between px-2 py-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Credits Remaining
              </span>
            </div>
            <span className="text-sm font-bold text-blue-800">
              {getTotalRemainingCredits()}
            </span>
          </div>
          
          <Link
            href="/dashboard"
            className="block px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/faq"
            className="block px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            FAQ
          </Link>

          {/* Install App Button for Mobile */}
          {isMobile && isInstallable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInstallApp}
              className="w-full justify-start text-gray-700 hover:bg-gray-100 cursor-pointer hover:shadow-md"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          )}

          <div className="py-2 border-t border-gray-200">
            <Button asChild variant="ghost" size="sm" title="Profile" className='w-full justify-start' style={{justifyContent: 'flex-start'}}>
              <Link href="/profile" className='w-full'>
                <User className="h-4 w-4 mr-2" /><span className="text-sm text-gray-700">
                {user.fullName || user.email}
              </span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-gray-600 hover:text-gray-900 cursor-pointer hover:shadow-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        {/* Mobile Anonymous Credit Display */}
        <div className="flex items-center justify-between px-2 py-2 bg-blue-50 rounded-lg mb-3">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Free Credits
            </span>
          </div>
          <span className="text-sm font-bold text-blue-800">
            {getTotalRemainingCredits()}
          </span>
        </div>
        
        {/* Install App Button for Mobile (Anonymous Users) */}
        {isMobile && isInstallable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInstallApp}
            className="w-full justify-start text-gray-700 hover:bg-gray-100 mb-3 cursor-pointer hover:shadow-md"
          >
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
        )}

        <Link
          href="/faq"
          className="block px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={() => setIsMenuOpen(false)}
        >
          FAQ
        </Link>
        <Link
          href="/packages"
          className="block px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={() => setIsMenuOpen(false)}
        >
          Pricing
        </Link>
        <Link
          href="/signin"
          className="block px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={() => setIsMenuOpen(false)}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="block px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={() => setIsMenuOpen(false)}
        >
          Sign Up
        </Link>
      </>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg items-center justify-center hidden md:flex">
                <img src="/og-image.png" style={{ minHeight: "60px",minWidth:"60px" }}/ >
              </div>
              <span className="text-xl font-bold text-gray-900">
                Spark Connects
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {renderDesktopAuth()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2 cursor-pointer hover:shadow-md"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-in fade-in duration-200">
            <div className="space-y-3">
              {renderMobileAuth()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
