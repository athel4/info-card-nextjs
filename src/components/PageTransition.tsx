import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  
  return (
    <div 
      key={pathname}
      className="animate-in slide-in-from-right-4 fade-in duration-300"
    >
      {children}
    </div>
  );
};