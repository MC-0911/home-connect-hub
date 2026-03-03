import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight } from "lucide-react";

interface MessagesSectionProps {
  unreadCount: number;
}

export function MessagesSection({ unreadCount }: MessagesSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Your Messages</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {unreadCount > 0
                ? `You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                : "All caught up! No unread messages."}
            </p>
            <Button onClick={() => navigate("/messages")} className="gap-2">
              Open Messages <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
