import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Send, Check, CheckCheck, ArrowLeft, Paperclip, X, Image, FileText, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Message, Conversation } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';
import { Link } from 'react-router-dom';

interface ChatViewProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string, attachment?: { url: string; type: string; name: string }) => Promise<void>;
  onUploadAttachment: (file: File) => Promise<{ url: string; type: string; name: string } | null>;
  onBack?: () => void;
}

export const ChatView = ({ conversation, messages, onSendMessage, onUploadAttachment, onBack }: ChatViewProps) => {
  const { user } = useAuth();
  const { isUserOnline, getLastSeen } = usePresence();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherUserId = conversation.other_user?.id;
  const isOnline = otherUserId ? isUserOnline(otherUserId) : false;
  const lastSeen = otherUserId ? getLastSeen(otherUserId) : null;

  const initials = conversation.other_user?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation.id]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;
    
    setSending(true);
    const content = newMessage;
    setNewMessage('');
    
    let attachment: { url: string; type: string; name: string } | undefined;
    
    if (selectedFile) {
      const uploaded = await onUploadAttachment(selectedFile);
      if (uploaded) {
        attachment = uploaded;
      }
      setSelectedFile(null);
      setPreviewUrl(null);
    }
    
    await onSendMessage(content, attachment);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImageAttachment = (type: string | null) => type?.startsWith('image/');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const getStatusText = () => {
    if (isOnline) return 'Online';
    if (lastSeen) {
      return `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`;
    }
    return 'Offline';
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {conversation.other_user?.full_name || 'Unknown User'}
          </p>
          <p className={cn(
            "text-xs",
            isOnline ? "text-green-500" : "text-muted-foreground"
          )}>
            {getStatusText()}
          </p>
        </div>

        {conversation.property && (
          <Link
            to={`/property/${conversation.property.id}`}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors"
          >
            {conversation.property.images?.[0] && (
              <img
                src={conversation.property.images[0]}
                alt=""
                className="w-8 h-8 rounded object-cover"
              />
            )}
            <span className="text-sm text-muted-foreground truncate max-w-32">
              {conversation.property.title}
            </span>
          </Link>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex justify-center mb-4">
                <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                  {formatDateHeader(date)}
                </span>
              </div>
              
              <div className="space-y-2">
                {dateMessages.map((message, index) => {
                  const isMine = message.sender_id === user?.id;
                  const showAvatar = !isMine && (
                    index === 0 || 
                    dateMessages[index - 1]?.sender_id !== message.sender_id
                  );

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        isMine ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMine && (
                        <div className="w-8">
                          {showAvatar && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-[70%] px-4 py-2 rounded-2xl",
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        {/* Attachment */}
                        {message.attachment_url && (
                          <div className="mb-2">
                            {isImageAttachment(message.attachment_type) ? (
                              <a href={message.attachment_url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={message.attachment_url}
                                  alt={message.attachment_name || 'Image'}
                                  className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                />
                              </a>
                            ) : (
                              <a
                                href={message.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded-lg",
                                  isMine ? "bg-primary-foreground/20" : "bg-background/50"
                                )}
                              >
                                <FileText className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm truncate flex-1">
                                  {message.attachment_name || 'File'}
                                </span>
                                <Download className="h-4 w-4 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        )}
                        
                        {message.content && !message.content.startsWith('Sent ') && (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          isMine ? "justify-end" : "justify-start"
                        )}>
                          <span className={cn(
                            "text-[10px]",
                            isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {formatMessageTime(message.created_at)}
                          </span>
                          {isMine && (
                            message.is_read ? (
                              <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                            ) : (
                              <Check className="h-3 w-3 text-primary-foreground/70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-2 bg-muted rounded-lg flex items-center gap-2">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded object-cover" />
            ) : (
              <div className="w-12 h-12 rounded bg-background flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={clearSelectedFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && !selectedFile) || sending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
