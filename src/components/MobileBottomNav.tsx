'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Upload, Users, Package, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../presentation/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      key: 'home',
      show: true,
    },
    {
      icon: Users,
      label: 'Contacts',
      path: '/dashboard',
      key: 'contacts',
      show: !!user,
    },
    {
      icon: Package,
      label: 'Packages',
      path: '/packages',
      key: 'packages',
      show: true,
    },
    {
      icon: User,
      label: user ? 'Profile' : 'Sign In',
      path: user ? '/profile' : '/signin',
      key: 'profile',
      show: true,
    },
  ].filter(item => item.show);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
          key={item.key}
          variant="ghost"
          size="sm"
          onClick={() => router.push(item.path)}
          className={`flex-1 flex-col gap-1 h-12 max-w-20 cursor-pointer hover:shadow-md transition-all ${
            active 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className="h-5 w-5" />
          <span className="text-xs font-medium">{item.label}</span>
        </Button>
          );
        })}
      </div>
    </div>
  );
};
