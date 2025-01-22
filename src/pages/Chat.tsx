import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  type: 'human' | 'ai';
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { signOut } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error fetching messages",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setMessages(data.map(msg => ({
          id: msg.id,
          content: msg.message.content,
          type: msg.message.type
        })));
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        const newMessage = {
          id: payload.new.id,
          content: payload.new.message.content,
          type: payload.new.message.type
        };
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(false);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId, toast]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    setIsLoading(true);
    const requestId = uuidv4();

    try {
      const response = await fetch('http://localhost:8001/api/pydantic-github-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          user_id: 'NA',
          request_id: requestId,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <ConversationSidebar
        currentSessionId={sessionId}
        onSessionSelect={setSessionId}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-4">
          <button
            onClick={() => signOut()}
            className="text-sm text-primary/60 hover:text-primary transition-colors"
          >
            Sign Out
          </button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                type={message.type}
              />
            ))}
            {isLoading && (
              <div className="flex justify-center space-x-2 p-4">
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <div className="p-4 max-w-3xl mx-auto w-full">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}