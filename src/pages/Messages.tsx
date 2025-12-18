import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatView } from '@/components/messages/ChatView';
import { useMessages, Conversation } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loading,
    fetchMessages,
    sendMessage,
    uploadAttachment,
    startConversation,
  } = useMessages();
  const { fetchPresence } = usePresence();
  const [showChat, setShowChat] = useState(false);

  // Handle URL params for starting new conversation
  useEffect(() => {
    const sellerId = searchParams.get('seller');
    const propertyId = searchParams.get('property');
    
    if (sellerId && user) {
      startConversation(sellerId, propertyId || undefined).then((conv) => {
        if (conv) {
          const enrichedConv = conversations.find(c => c.id === conv.id);
          if (enrichedConv) {
            setActiveConversation(enrichedConv);
            setShowChat(true);
          }
        }
      });
    }
  }, [searchParams, user, conversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      
      // Fetch presence for other user
      if (activeConversation.other_user?.id) {
        fetchPresence([activeConversation.other_user.id]);
      }
    }
  }, [activeConversation?.id]);

  // Fetch presence for all conversation users
  useEffect(() => {
    const userIds = conversations
      .map(c => c.other_user?.id)
      .filter((id): id is string => !!id);
    
    if (userIds.length > 0) {
      fetchPresence(userIds);
    }
  }, [conversations]);

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setShowChat(true);
  };

  const handleSendMessage = async (content: string, attachment?: { url: string; type: string; name: string }) => {
    if (activeConversation) {
      await sendMessage(activeConversation.id, content, attachment);
    }
  };

  const handleBack = () => {
    setShowChat(false);
    setActiveConversation(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
          <div className="bg-card rounded-xl border border-border shadow-sm h-full overflow-hidden">
            <div className="flex h-full">
              {/* Conversations List */}
              <div className={cn(
                "w-full lg:w-80 xl:w-96 border-r border-border flex flex-col",
                showChat && "hidden lg:flex"
              )}>
                <div className="p-4 border-b border-border">
                  <h1 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Messages
                  </h1>
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
              <div className={cn(
                "flex-1 flex flex-col",
                !showChat && "hidden lg:flex"
              )}>
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
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-medium text-foreground mb-2">
                      Select a conversation
                    </h2>
                    <p className="text-muted-foreground max-w-sm">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
