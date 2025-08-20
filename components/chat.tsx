'use client';

// Step 1: Import necessary React hooks and utilities
import { useState } from 'react';
import { generateUUID } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import { useN8nIntegration } from '@/hooks/use-n8n-integration';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Messages } from './messages';
import { ThemeToggle } from './theme-toggle';

// Step 2: Define TypeScript interface for chat messages
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Step 3: Main Chat component that handles user interactions
export function Chat({
  id,
  initialMessages = [],
}: {
  id: string;
  initialMessages: ChatMessage[];
}) {
  // Step 4: Initialize component state
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 5: Get persistent session ID from localStorage
  const { sessionId, setSessionId } = useSession();
  
  // Step 5.1: Initialize n8n integration hook
  const { sendMessageAndProcess } = useN8nIntegration();

  // Step 6: Enhanced function to send messages with n8n integration
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      content: content.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Primeiro, enviar para o n8n e processar resposta
      const n8nResponse = await sendMessageAndProcess(content.trim(), id);
      
      // Se houver resposta do n8n, adicionar como mensagem do assistente
      if (n8nResponse) {
        setMessages(prev => [...prev, {
          id: generateUUID(),
          role: 'assistant',
          content: n8nResponse,
        }]);
      } else {
        // Fallback para API original se n8n não retornar resposta
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            message: userMessage,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const assistantMessage = await response.json();
        
        // Update session ID if returned from API
        if (assistantMessage.sessionId) {
          setSessionId(assistantMessage.sessionId);
        }

        setMessages(prev => [...prev, {
          id: assistantMessage.id || generateUUID(),
          role: 'assistant',
          content: assistantMessage.content || 'No response received',
        }]);
      }
    } catch (error) {
      console.error('Erro na integração com n8n:', error);
      setMessages(prev => [...prev, {
        id: generateUUID(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Step 6: Header with theme toggle */}
      <header className="flex justify-between items-center p-4 border-b border-border/40">
        <h1 className="text-xl font-semibold text-foreground">Chat</h1>
        <ThemeToggle />
      </header>
      
      {/* Step 7: Display chat messages */}
      <div className="flex-1 overflow-y-auto px-4">
        <Messages
          chatId={id}
          messages={messages}
          isLoading={isLoading}
          sendMessage={sendMessage}
        />
      </div>
      
      <div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-h-[60px] max-h-[200px] resize-none rounded-xl border-border/50 focus:border-primary/50 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="h-[60px] px-6 rounded-xl bg-primary hover:bg-primary/90 transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
