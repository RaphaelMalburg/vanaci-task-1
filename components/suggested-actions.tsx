'use client';

// Step 1: Import necessary dependencies for animations and UI components
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';

// Step 2: Define TypeScript interface for component props
interface SuggestedActionsProps {
  chatId: string;
  sendMessage: (content: string) => void;
}

// Step 3: Pure component for rendering suggested actions
function PureSuggestedActions({
  chatId,
  sendMessage,
}: SuggestedActionsProps) {
  // Step 1: Define suggested actions for user interaction
  const suggestedActions = [
    {
      title: 'Conversar com a IA',
      label: 'sobre qualquer assunto',
      action: 'Olá! Gostaria de conversar sobre tecnologia, ciência, ou qualquer outro tópico que te interesse.',
    },
    {
      title: 'Pedir ajuda para',
      label: 'resolver problemas',
      action: 'Preciso de ajuda para resolver um problema. Você pode me orientar passo a passo?',
    },
    {
      title: 'Solicitar redirecionamento',
      label: 'para outra página',
      action: 'Gostaria de ser redirecionado para uma página específica. Você pode me ajudar com isso?',
    },
    {
      title: 'Obter informações',
      label: 'sobre navegação no site',
      action: 'Como posso navegar melhor neste site? Quais páginas estão disponíveis?',
    },
  ];

  return (
    // Step 3: Render suggested actions in a responsive grid
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto"
    >
      {/* Step 4: Map through each suggested action with animation */}
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          {/* Step 5: Create clickable button for each suggestion */}
          <Button
            variant="outline"
            onClick={async () => {
              // Step 2: Send the suggested action message
              sendMessage(suggestedAction.action);
            }}
            className="h-auto p-6 text-left justify-start hover:bg-muted/50 transition-all duration-200 border-border/50 hover:border-primary/30 rounded-xl group w-full"
          >
            <div className="space-y-2">
              <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {suggestedAction.title}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {suggestedAction.label}
              </div>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

// Step 6: Export memoized component with custom comparison for performance
export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    // Only re-render if chatId changes
    if (prevProps.chatId !== nextProps.chatId) return false;
    
    return true;
  },
);
