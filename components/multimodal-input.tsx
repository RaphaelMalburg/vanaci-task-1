'use client';

import { useState, useRef, type FormEvent } from 'react';
import { ArrowUpIcon } from './icons';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface MultimodalInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  className?: string;
}

export function MultimodalInput({
  onSendMessage,
  isLoading,
  className,
}: MultimodalInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    
    if (!input.trim() || isLoading) {
      return;
    }

    onSendMessage(input.trim());
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={`relative ${className || ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end border rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
            disabled={isLoading}
          />
          
          <div className="absolute right-2 bottom-2">
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 p-0"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
