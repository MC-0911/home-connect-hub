import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function BuyerMessagesSection() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-accent" />
        <h2 className="text-2xl font-bold">Messages</h2>
      </div>

      <div className="text-center py-16 bg-card rounded-xl border border-border">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Your Messages</h3>
        <p className="text-muted-foreground mb-6">View and manage all your conversations with property owners and agents.</p>
        <Button onClick={() => navigate("/messages")}>
          Open Messages
        </Button>
      </div>
    </div>
  );
}
