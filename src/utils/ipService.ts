import { supabase } from '@/integrations/supabase/client';

export const getUserIP = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-client-ip');
    if (error) {
      console.warn('Could not get IP:', error);
      return '127.0.0.1';
    }
    return data?.ip || '127.0.0.1';
  } catch (error) {
    console.warn('Could not get IP:', error);
    return '127.0.0.1';
  }
};