'use client';

import { useState } from 'react';
import { generateUUID } from '@/lib/utils';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function Chat({
  id,
  initialMessages = [],
}: {
  id: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(id);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
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

      const data = await response.json();

      // Se for uma resposta de navegação, redireciona
      if (data.type === 'navigation' && data.url) {
        window.location.href = data.url;
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const assistantMessage = await response.json();

      // Handle navigation responses
      if (assistantMessage.type === 'navigation' && assistantMessage.url) {
        window.location.href = assistantMessage.url;
        return;
      }

      // Update session ID if returned from API
      if (assistantMessage.sessionId) {
        setSessionId(assistantMessage.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessage.id || generateUUID(),
          role: 'assistant',
          content: assistantMessage.content || 'No response received',
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: generateUUID(),
          role: 'assistant',
          content: 'Sorry, there was an error processing your message.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Messages chatId={id} messages={messages} isLoading={isLoading} />
      </div>

      <div className="border-t p-4">
        <div className="mb-2 text-sm text-muted-foreground">
          Session ID: {sessionId}
        </div>
        <MultimodalInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
