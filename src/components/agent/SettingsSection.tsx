import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export function SettingsSection() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Agent Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {profile?.full_name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{profile?.full_name || "Agent"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Mail, label: "Email", value: user?.email },
              { icon: Phone, label: "Phone", value: profile?.phone || "Not set" },
              { icon: MapPin, label: "Location", value: profile?.location || "Not set" },
              { icon: User, label: "Bio", value: profile?.bio || "Not set" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                </div>
                <p className="text-sm text-foreground truncate">{item.value}</p>
              </div>
            ))}
          </div>

          <Button onClick={() => navigate("/profile")} className="gap-2">
            Edit Full Profile <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
