import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
}

export interface Conversation {
  id: string;
  property_id: string | null;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  // Joined data
  property?: {
    id: string;
    title: string;
    images: string[];
  } | null;
  other_user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  last_message?: Message | null;
  unread_count?: number;
}

export const useMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: convos, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch additional data for each conversation
      const enrichedConvos = await Promise.all(
        (convos || []).map(async (convo) => {
          const otherId = convo.buyer_id === user.id ? convo.seller_id : convo.buyer_id;
          
          // Fetch other user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id:user_id, full_name, avatar_url')
            .eq('user_id', otherId)
            .maybeSingle();

          // Fetch property if exists
          let property = null;
          if (convo.property_id) {
            const { data: prop } = await supabase
              .from('properties')
              .select('id, title, images')
              .eq('id', convo.property_id)
              .maybeSingle();
            property = prop;
          }

          // Fetch last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convo.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convo.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          return {
            ...convo,
            other_user: profile,
            property,
            last_message: lastMsg,
            unread_count: count || 0,
          };
        })
      );

      setConversations(enrichedConvos);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    }
  }, [user]);

  // Send a message
  const sendMessage = async (
    conversationId: string, 
    content: string,
    attachment?: { url: string; type: string; name: string }
  ) => {
    if (!user || (!content.trim() && !attachment)) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim() || (attachment ? `Sent ${attachment.type.startsWith('image/') ? 'an image' : 'a file'}` : ''),
          attachment_url: attachment?.url || null,
          attachment_type: attachment?.type || null,
          attachment_name: attachment?.name || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return null;
    }
  };

  // Upload attachment - now requires conversationId for secure storage
  const uploadAttachment = async (conversationId: string, file: File): Promise<{ url: string; type: string; name: string } | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      // Store files in conversation folder for RLS policy to work
      const fileName = `${conversationId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Use signed URL since bucket is private - valid for 1 year
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('message-attachments')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365);

      if (signedUrlError) throw signedUrlError;

      return {
        url: signedUrlData.signedUrl,
        type: file.type,
        name: file.name,
      };
    } catch (error: any) {
      console.error('Error uploading attachment:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    }
  };

  // Start or get existing conversation
  const startConversation = async (sellerId: string, propertyId?: string) => {
    if (!user) return null;

    try {
      // Check for existing conversation
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          property_id: propertyId || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchConversations();
      return data;
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
  }, [conversations]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            
            // Update messages if viewing this conversation
            if (activeConversation && newMessage.conversation_id === activeConversation.id) {
              setMessages(prev => [...prev, newMessage]);
              
              // Mark as read if not sender
              if (newMessage.sender_id !== user.id) {
                supabase
                  .from('messages')
                  .update({ is_read: true, read_at: new Date().toISOString() })
                  .eq('id', newMessage.id);
              }
            }
            
            // Refresh conversations list
            fetchConversations();
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(m => m.id === payload.new.id ? payload.new as Message : m)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, activeConversation, fetchConversations]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loading,
    typingUsers,
    fetchConversations,
    fetchMessages,
    sendMessage,
    uploadAttachment,
    startConversation,
    getUnreadCount,
  };
};
