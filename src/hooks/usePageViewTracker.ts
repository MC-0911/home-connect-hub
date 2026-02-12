import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  // Check for tablet first (iPads, Android tablets, etc.)
  if (/ipad|tablet|playbook|silk/i.test(ua) || (width >= 768 && width <= 1024 && /android/i.test(ua))) {
    return 'tablet';
  }

  // Check for mobile
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/i.test(ua) || width < 768) {
    return 'mobile';
  }

  return 'desktop';
}

function getSessionId(): string {
  const key = 'rl_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function usePageViewTracker() {
  const location = useLocation();
  const tracked = useRef(new Set<string>());

  useEffect(() => {
    const pageKey = location.pathname;
    if (tracked.current.has(pageKey)) return;
    tracked.current.add(pageKey);

    const sessionId = getSessionId();
    const deviceType = getDeviceType();

    supabase
      .from('page_views')
      .insert({ session_id: sessionId, device_type: deviceType, page_path: pageKey })
      .then(({ error }) => {
        if (error) console.error('Page view tracking error:', error);
      });
  }, [location.pathname]);
}
