'use client';

import { useState, useRef, useEffect } from 'react';
import {
  useListAiChatMessages,
  useSendAiChatMessage,
  useGetSettings,
} from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Brain,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AiChatMessage } from '@/types';

export function ChatWidget() {
  const { data: settings } = useGetSettings();
  const isOwner = settings?.activeRole === 'owner';
  const [open, setOpen] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { data: messages = [], isLoading } = useListAiChatMessages();
  const sendMessage = useSendAiChatMessage();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || sendMessage.isPending) return;

    setInput('');
    sendMessage.mutate(
      { message: text },
      {
        onError: (err) => {
          toast({ title: "Failed to send message", description: String(err), variant: "destructive" });
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-10rem)] bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">SalesPulse AI</p>
            <p className="text-[10px] text-muted-foreground">Ask about your business</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-12 w-3/4 bg-muted rounded-lg" />
              <div className="h-16 w-2/3 bg-muted rounded-lg ml-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 opacity-30" />
              </div>
              <p className="text-sm font-medium mb-1">How can I help you today?</p>
              <p className="text-xs max-w-[240px] mx-auto">
                Ask about sales, inventory, customers, expenses, or anything about your business.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))
          )}

          {sendMessage.isPending && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-3 bg-muted/5 shrink-0">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sendMessage.isPending}
            className="flex-1 h-9 text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            size="icon"
            className="h-9 w-9 shrink-0"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: AiChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser ? 'bg-primary/10' : 'bg-muted/20'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </div>
      <div
        className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted/50 rounded-tl-sm'
        }`}
      >
        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isUser ? '' : 'text-foreground'}`}>
          {message.content}
        </p>
        {message.model && !isUser && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground/50">
            <Brain className="w-3 h-3" />
            {message.model}
          </div>
        )}
      </div>
    </div>
  );
}
