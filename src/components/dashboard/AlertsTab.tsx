import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertContent, AlertIcon, AlertTitle, AlertDescription, AlertToolbar } from "@/components/ui/alert-1";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface AlertItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export function AlertsTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAlerts();
      subscribeToAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts((data as AlertItem[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAlerts = () => {
    const channel = supabase
      .channel("alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          setAlerts((prev) => [payload.new as AlertItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      if (error) throw error;
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark alert as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("user_id", user?.id)
        .eq("is_read", false);

      if (error) throw error;
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      toast({
        title: "Success",
        description: "All alerts marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark alerts as read",
        variant: "destructive",
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast({
        title: "Success",
        description: "Alert deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete alert",
        variant: "destructive",
      });
    }
  };

  const createTestAlerts = async () => {
    if (!user) return;
    
    const testAlerts = [
      {
        user_id: user.id,
        title: "Welcome to LandMarket!",
        message: "Your account has been set up successfully. Start exploring properties.",
        type: "success",
        link: "/properties",
      },
      {
        user_id: user.id,
        title: "Complete Your Profile",
        message: "Add a profile photo and bio to help others trust you.",
        type: "info",
        link: "/profile",
      },
      {
        user_id: user.id,
        title: "Listing Needs Attention",
        message: "One of your listings is missing important details. Please review.",
        type: "warning",
        link: "/dashboard",
      },
      {
        user_id: user.id,
        title: "Payment Failed",
        message: "We couldn't process your last payment. Please update your billing info.",
        type: "error",
        link: null,
      },
    ];

    try {
      const { error } = await supabase.from("alerts").insert(testAlerts);
      if (error) throw error;
      toast({
        title: "Test Alerts Created",
        description: "4 test alerts with different types have been added",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create test alerts",
        variant: "destructive",
      });
    }
  };

  const getAlertVariant = (type: string): "success" | "warning" | "destructive" | "info" | "secondary" => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "destructive";
      case "info":
        return "info";
      default:
        return "secondary";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  const handleAlertClick = (alert: AlertItem) => {
    if (!alert.is_read) {
      markAsRead(alert.id);
    }
    if (alert.link) {
      navigate(alert.link);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="font-display text-xl text-foreground">
            Alerts
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={createTestAlerts}>
            <Plus className="w-4 h-4 mr-2" />
            Create Test Alerts
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No alerts yet
            </h3>
            <p className="text-muted-foreground">
              You'll receive alerts about your listings and activities here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                variant={getAlertVariant(alert.type)}
                appearance={alert.is_read ? "outline" : "light"}
                size="md"
                className={`transition-all ${alert.link ? "cursor-pointer hover:opacity-90" : ""} ${
                  !alert.is_read ? "ring-1 ring-accent/20" : ""
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <AlertIcon>
                  {getAlertIcon(alert.type)}
                </AlertIcon>
                <AlertContent>
                  <div className="flex items-center gap-2">
                    <AlertTitle>{alert.title}</AlertTitle>
                    {!alert.is_read && (
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    )}
                  </div>
                  <AlertDescription>{alert.message}</AlertDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(alert.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </AlertContent>
                <AlertToolbar>
                  {!alert.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(alert.id);
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAlert(alert.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertToolbar>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
