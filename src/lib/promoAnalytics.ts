import { supabase } from "@/integrations/supabase/client";

type EventType = "impression" | "cta_click";

function getSessionId(): string {
  const key = "rl_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

function getDeviceType(): "desktop" | "mobile" | "tablet" {
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|android.*mobile/i.test(ua) || width < 768) return "mobile";
  return "desktop";
}

// Dedupe impressions per session so we don't spam the DB on re-renders/scroll.
const seen = new Set<string>();

export function trackPromoEvent(eventType: EventType, offerId?: string | null) {
  const key = `${eventType}:${offerId ?? "cta"}`;
  if (eventType === "impression" && seen.has(key)) return;
  seen.add(key);

  supabase
    .from("promo_offer_events")
    .insert({
      offer_id: offerId ?? null,
      event_type: eventType,
      session_id: getSessionId(),
      device_type: getDeviceType(),
      page_path: window.location.pathname,
    })
    .then(({ error }) => {
      if (error) console.error("Promo analytics error:", error);
    });
}
