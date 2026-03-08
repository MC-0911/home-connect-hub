import { useState, useEffect } from "react";
import { Bell, Shield, Lock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface NotificationPreferences {
  newLeadAlerts: boolean;
  messageNotifications: boolean;
  appointmentReminders: boolean;
  pushNotifications: boolean;
}

const defaultPreferences: NotificationPreferences = {
  newLeadAlerts: true,
  messageNotifications: true,
  appointmentReminders: true,
  pushNotifications: true,
};

export function NotificationSecurityCards() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Load preferences from Supabase on mount
  useEffect(() => {
    if (!user) return;
    const loadPreferences = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("user_id", user.id)
        .single();

      if (!error && data?.notification_preferences) {
        setNotifications({ ...defaultPreferences, ...(data.notification_preferences as NotificationPreferences) });
      }
      setLoading(false);
    };
    loadPreferences();
  }, [user]);

  const toggleNotification = async (key: keyof NotificationPreferences) => {
    if (!user) return;
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);

    const { error } = await supabase
      .from("profiles")
      .update({ notification_preferences: updated as any })
      .eq("user_id", user.id);

    if (error) {
      // Revert on failure
      setNotifications(notifications);
      toast({ title: "Error", description: "Failed to save preference.", variant: "destructive" });
    } else {
      toast({
        title: updated[key] ? "Enabled" : "Disabled",
        description: `${notificationItems.find(i => i.key === key)?.title} ${updated[key] ? "enabled" : "disabled"}.`,
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const notificationItems = [
    { key: "newLeadAlerts" as const, title: "New Lead Alerts", desc: "Get notified when you receive a new lead" },
    { key: "messageNotifications" as const, title: "Message Notifications", desc: "Receive email for new messages" },
    { key: "appointmentReminders" as const, title: "Appointment Reminders", desc: "Get reminders for upcoming appointments" },
    { key: "pushNotifications" as const, title: "Push Notifications", desc: "Enable browser push notifications" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Notification Preferences</CardTitle>
          </div>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            notificationItems.map((item, i) => (
              <div key={item.key}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={() => toggleNotification(item.key)}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Security</CardTitle>
          </div>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-xs text-muted-foreground">Change your account password</p>
            </div>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(true)} className="gap-2">
              <Lock className="h-4 w-4" /> Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your new password below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
