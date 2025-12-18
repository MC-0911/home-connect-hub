import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

export const usePresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());

  // Update own presence
  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user) return;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: isOnline,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user]);

  // Get user's online status
  const isUserOnline = useCallback((userId: string) => {
    const presence = onlineUsers.get(userId);
    if (!presence) return false;
    
    // Consider user online if last seen within 5 minutes
    const lastSeen = new Date(presence.last_seen);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return presence.is_online && lastSeen > fiveMinutesAgo;
  }, [onlineUsers]);

  // Get last seen time
  const getLastSeen = useCallback((userId: string) => {
    const presence = onlineUsers.get(userId);
    return presence?.last_seen || null;
  }, [onlineUsers]);

  // Fetch presence for specific users
  const fetchPresence = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) return;

    try {
      const { data } = await supabase
        .from('user_presence')
        .select('*')
        .in('user_id', userIds);

      if (data) {
        const presenceMap = new Map(onlineUsers);
        data.forEach(p => presenceMap.set(p.user_id, p));
        setOnlineUsers(presenceMap);
      }
    } catch (error) {
      console.error('Error fetching presence:', error);
    }
  }, [onlineUsers]);

  // Set up presence tracking
  useEffect(() => {
    if (!user) return;

    // Set online on mount
    updatePresence(true);

    // Update presence periodically
    const interval = setInterval(() => updatePresence(true), 60000);

    // Set offline on unmount
    return () => {
      clearInterval(interval);
      updatePresence(false);
    };
  }, [user, updatePresence]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibility = () => {
      updatePresence(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [updatePresence]);

  // Subscribe to presence changes
  useEffect(() => {
    const channel = supabase
      .channel('presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        (payload) => {
          const presence = payload.new as UserPresence;
          setOnlineUsers(prev => {
            const newMap = new Map(prev);
            newMap.set(presence.user_id, presence);
            return newMap;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    isUserOnline,
    getLastSeen,
    fetchPresence,
    updatePresence,
  };
};
