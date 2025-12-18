import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Conversation } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conversation: Conversation) => void;
}

export const ConversationList = ({ conversations, activeId, onSelect }: ConversationListProps) => {
  const { isUserOnline } = usePresence();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start a conversation by contacting a property seller
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {conversations.map((conv) => {
          const isOnline = conv.other_user?.id ? isUserOnline(conv.other_user.id) : false;
          const initials = conv.other_user?.full_name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase() || '?';

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={cn(
                "w-full p-4 text-left hover:bg-secondary/5 transition-colors",
                activeId === conv.id && "bg-secondary/10"
              )}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground truncate">
                      {conv.other_user?.full_name || 'Unknown User'}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {conv.property && (
                    <p className="text-xs text-primary truncate mb-1">
                      Re: {conv.property.title}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message?.content || 'No messages yet'}
                    </p>
                    {conv.unread_count && conv.unread_count > 0 && (
                      <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center rounded-full text-xs">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
