import { useEffect, useState, useCallback } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

interface AlertsDropdownProps {
  unreadCount: number;
  onMarkRead?: () => void;
}

export function AlertsDropdown({ unreadCount, onMarkRead }: AlertsDropdownProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setAlerts(data);
  }, [user]);

  useEffect(() => {
    if (open) fetchAlerts();
  }, [open, fetchAlerts]);

  const markAsRead = async (alertId: string) => {
    await supabase.from("alerts").update({ is_read: true }).eq("id", alertId);
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)));
    onMarkRead?.();
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("alerts").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    onMarkRead?.();
  };

  const typeColor: Record<string, string> = {
    success: "bg-emerald-500",
    info: "bg-blue-500",
    warning: "bg-amber-500",
    destructive: "bg-destructive",
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <ScrollArea className="max-h-80">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/30 last:border-0",
                  !alert.is_read && "bg-primary/5"
                )}
                onClick={() => !alert.is_read && markAsRead(alert.id)}
              >
                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", typeColor[alert.type] || "bg-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm truncate", !alert.is_read ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {alert.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!alert.is_read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(alert.id); }}
                    className="shrink-0 p-1 rounded hover:bg-muted"
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
