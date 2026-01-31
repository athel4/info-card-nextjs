'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/presentation/contexts/AuthContext";
import { CreditProvider } from "@/presentation/contexts/CreditContext";
import { ApplicationServiceProvider } from "@/presentation/contexts/ApplicationServiceContext";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ApplicationServiceProvider>
            <AuthProvider>
              <CreditProvider>
                {children}
                <Toaster />
                <Sonner />
              </CreditProvider>
            </AuthProvider>
          </ApplicationServiceProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
