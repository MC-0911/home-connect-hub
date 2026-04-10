import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export function useAgentVerification() {
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStatus('none');
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data, error } = await supabase
        .from('agent_verifications')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching verification:', error);
      }
      setStatus((data?.status as VerificationStatus) || 'none');
      setLoading(false);
    };

    fetch();

    const channel = supabase
      .channel('agent-verification')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agent_verifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        setStatus((payload.new?.status as VerificationStatus) || 'none');
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return { status, loading };
}
