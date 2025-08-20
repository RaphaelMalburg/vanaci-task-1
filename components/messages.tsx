import { memo } from 'react';
import { motion } from 'framer-motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MessagesProps {
  chatId: string;
  messages: ChatMessage[];
  isLoading: boolean;
}

function PureMessages({ messages, isLoading }: MessagesProps) {
  return (
    <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 px-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-2xl font-semibold mb-2">Welcome to Chat</h1>
          <p className="text-muted-foreground">
            Start a conversation by typing a message below.
          </p>
        </div>
      )}
      
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </motion.div>
      ))}
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="bg-muted text-foreground rounded-lg px-4 py-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export const Messages = memo(PureMessages);
