import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Conversation {
  session_id: string;
  title: string;
}

interface ConversationSidebarProps {
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
}

export function ConversationSidebar({ currentSessionId, onSessionSelect }: ConversationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('session_id, message')
        .order('created_at', { ascending: true });

      if (!error && data) {
        const uniqueConversations = data.reduce((acc: Conversation[], curr) => {
          if (!acc.find(c => c.session_id === curr.session_id)) {
            const firstMessage = curr.message.content.substring(0, 100);
            acc.push({
              session_id: curr.session_id,
              title: firstMessage
            });
          }
          return acc;
        }, []);
        setConversations(uniqueConversations);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 glass-morphism",
        isCollapsed ? "w-16" : "w-80"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <h2 className="text-lg font-semibold">Conversations</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-2 space-y-2">
          {conversations.map((conversation) => (
            <Button
              key={conversation.session_id}
              variant={currentSessionId === conversation.session_id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isCollapsed ? "px-2" : "px-4"
              )}
              onClick={() => onSessionSelect(conversation.session_id)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {!isCollapsed && (
                <span className="truncate">{conversation.title}</span>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}