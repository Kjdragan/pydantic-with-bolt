import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  type: 'human' | 'ai';
}

export function ChatMessage({ content, type }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg max-w-[80%] message-transition",
        type === 'human' ? 'ml-auto bg-primary/10' : 'mr-auto glass-morphism'
      )}
    >
      {type === 'human' ? (
        <p className="text-sm">{content}</p>
      ) : (
        <ReactMarkdown className="markdown">{content}</ReactMarkdown>
      )}
    </div>
  );
}