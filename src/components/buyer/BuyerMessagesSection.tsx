import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatView } from "@/components/messages/ChatView";
import { useMessages, Conversation } from "@/hooks/useMessages";
import { usePresence } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";

export function BuyerMessagesSection() {
  const {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loading,
    fetchMessages,
    sendMessage,
    uploadAttachment,
  } = useMessages();
  const { fetchPresence } = usePresence();
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      if (activeConversation.other_user?.id) {
        fetchPresence([activeConversation.other_user.id]);
      }
    }
  }, [activeConversation?.id]);

  useEffect(() => {
    const userIds = conversations
      .map((c) => c.other_user?.id)
      .filter((id): id is string => !!id);
    if (userIds.length > 0) {
      fetchPresence(userIds);
    }
  }, [conversations]);

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setShowChat(true);
  };

  const handleSendMessage = async (
    content: string,
    attachment?: { url: string; type: string; name: string }
  ) => {
    if (activeConversation) {
      await sendMessage(activeConversation.id, content, attachment);
    }
  };

  const handleBack = () => {
    setShowChat(false);
    setActiveConversation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/20">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Messages</h2>
          <p className="text-sm text-muted-foreground">Your conversations with property owners and agents</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden h-[calc(100vh-280px)] min-h-[500px]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div
            className={cn(
              "w-full lg:w-80 xl:w-96 border-r border-border/50 flex flex-col",
              showChat && "hidden lg:flex"
            )}
          >
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <p className="text-sm font-semibold text-foreground">All Conversations</p>
            </div>
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  activeId={activeConversation?.id || null}
                  onSelect={handleSelectConversation}
                />
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className={cn("flex-1 flex flex-col", !showChat && "hidden lg:flex")}>
            {activeConversation ? (
              <ChatView
                conversation={activeConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                onUploadAttachment={uploadAttachment}
                onBack={handleBack}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Select a conversation
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
