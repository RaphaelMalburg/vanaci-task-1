// Step 1: Import React memo for performance optimization and motion for animations
import { memo } from 'react';
import { motion } from 'framer-motion';
import { SuggestedActions } from './suggested-actions';
import { BotIcon, UserIcon } from './icons';

// Step 2: Define TypeScript interfaces for type safety
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MessagesProps {
  chatId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => void;
}

// Step 3: Pure component to render chat messages with animations
function PureMessages({ messages, isLoading, chatId, sendMessage }: MessagesProps) {
  return (
    <div className="flex flex-col space-y-6 py-8">
      {/* Step 4: Display welcome message when no messages exist */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to Chat
          </h2>
          <p className="text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
            Start a conversation by typing a message below or choose one of the suggestions.
          </p>
          <SuggestedActions chatId={chatId} sendMessage={sendMessage} />
        </motion.div>
      )}
      
      {/* Step 5: Render each message with improved styling */}
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          } px-4`}
        >
          <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
            message.role === 'user' 
              ? 'bg-primary text-primary-foreground ml-12' 
              : 'bg-muted/50 border border-border/50 mr-12'
          }`}>
            <div className="flex items-start gap-3">
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <BotIcon className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <UserIcon className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Step 6: Show loading indicator when waiting for response */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start px-4"
        >
          <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted/50 border border-border/50 mr-12">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <BotIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Step 7: Export memoized component for performance optimization
export const Messages = memo(PureMessages);
