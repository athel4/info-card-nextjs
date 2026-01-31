
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnonymousLimits {
  daily_credit_limit: number;
  reset_interval_hours: number;
}

export const useAnonymousLimits = () => {
  const [limits, setLimits] = useState<AnonymousLimits>({ daily_credit_limit: 5, reset_interval_hours: 24 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('anonymous_limits')
          .select('daily_credit_limit, reset_interval_hours')
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching anonymous limits:', error);
          setError(error.message);
          return;
        }

        if (data) {
          setLimits(data);
        }
      } catch (err) {
        console.error('Error in useAnonymousLimits:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimits();
  }, []);

  return { limits, isLoading, error };
};
