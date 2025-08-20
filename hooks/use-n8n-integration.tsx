import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Interface para resposta do n8n
interface N8nResponse {
  action?: 'redirect' | 'message';
  url?: string;
  message?: string;
  shouldRedirect?: boolean;
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
  const sendToN8n = useCallback(async (message: string, chatId: string): Promise<N8nResponse | null> => {
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
      
      if (!webhookUrl) {
        console.warn('N8N_WEBHOOK_URL não configurado');
        return null;
      }

      const payload: N8nPayload = {
        message,
        chatId,
        timestamp: new Date().toISOString()
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Adicionar bearer token se configurado
      const bearerToken = process.env.NEXT_PUBLIC_N8N_BEARER || process.env.N8N_BEARER;
      if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: N8nResponse = await response.json();
      
      // Processar resposta do n8n
      if (result.action === 'redirect' && result.url) {
        console.log('Redirecionamento solicitado pelo n8n:', result.url);
        return result;
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
      // Se houver redirecionamento
      if (response.action === 'redirect' && response.url) {
        handleRedirect(response.url);
        return `Redirecionando para: ${response.url}`;
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