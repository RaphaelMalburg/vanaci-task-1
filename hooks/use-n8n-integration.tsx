import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Interface para resposta do n8n
interface N8nResponse {
  action?: 'redirect' | 'message';
  url?: string;
  message?: string;
  shouldRedirect?: boolean;
  extractedAction?: {
    action?: 'redirect' | 'message';
    url?: string;
  };
}

// Interface para payload enviado ao n8n
interface N8nPayload {
  message: string;
  chatId: string;
  userId?: string;
  timestamp: string;
}

export function useN8nIntegration() {
  const router = useRouter();

  // Função para enviar mensagem ao n8n
  const sendToN8n = useCallback(async (message: string, sessionId: string): Promise<N8nResponse | null> => {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL não configurado');
      return null;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          sessionId,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: N8nResponse = await response.json();
      
      // Processar resposta do n8n
      // Verificar primeiro se há extractedAction (do processamento de markdown)
      const actionData = result.extractedAction || result;
      
      if (actionData.action === 'redirect' && actionData.url) {
        console.log('Redirecionamento solicitado pelo n8n:', actionData.url);
        return {
          ...result,
          action: actionData.action,
          url: actionData.url
        };
      }

      return result;

    } catch (error) {
      console.error('Erro ao enviar mensagem para n8n:', error);
      return null;
    }
  }, []);

  // Função para processar redirecionamento
  const handleRedirect = useCallback((url: string) => {
    try {
      // Validar se é uma URL válida
      const urlObj = new URL(url);
      
      // Se for uma URL externa, abrir em nova aba
      if (urlObj.origin !== window.location.origin) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Se for interna, usar router do Next.js
        router.push(url);
      }
    } catch (error) {
      console.error('URL inválida para redirecionamento:', url, error);
    }
  }, [router]);

  // Função para enviar mensagem e processar resposta
  const sendMessageAndProcess = useCallback(async (message: string, chatId: string): Promise<string | null> => {
    const response = await sendToN8n(message, chatId);
    
    if (response) {
      // Verificar primeiro se há extractedAction (do processamento de markdown)
      const actionData = response.extractedAction || response;
      
      // Se houver redirecionamento
      if (actionData.action === 'redirect' && actionData.url) {
        handleRedirect(actionData.url);
        return `Redirecionando para: ${actionData.url}`;
      }
      
      // Se houver mensagem de resposta
      if (response.message) {
        return response.message;
      }
    }
    
    return null;
  }, [sendToN8n, handleRedirect]);

  return {
    sendToN8n,
    handleRedirect,
    sendMessageAndProcess
  };
}