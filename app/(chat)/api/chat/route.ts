import { NextRequest } from 'next/server';
import { generateUUID } from '@/lib/utils';

// Step 1: Configure maximum duration for the API route (60 seconds)
export const maxDuration = 60;

// Step 2: Define TypeScript interfaces for type safety
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface PostRequestBody {
  id: string;
  message: ChatMessage;
  sessionId?: string;
}

// Step 3: Main POST handler for chat messages
export async function POST(request: NextRequest) {
  try {
    // Step 4: Parse the incoming request body
    const body: PostRequestBody = await request.json();
    const { message, sessionId } = body;

    // Step 5: Get n8n webhook URL from environment variables
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return Response.json(
        { error: 'N8N webhook URL not configured' },
        { status: 500 }
      );
    }

    // Step 6: Generate a unique session ID if not provided
    const currentSessionId = sessionId || generateUUID();

    // Step 7: Send user message to n8n webhook for processing
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const requestPayload = {
      sessionId: currentSessionId,
      message: message.content,
      timestamp: new Date().toISOString(),
    };
    
    let webhookResponse;
    try {
      webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });
      
    } catch (fetchError) {
      const error = fetchError as Error;
      console.error('Fetch error:', error.message);
      
      // Fallback response when fetch fails
      return Response.json({
        id: generateUUID(),
        role: 'assistant',
        content: `Recebi sua mensagem: "${message.content}". Erro de conexão com o sistema n8n (${error.message}). Sua mensagem foi registrada.`,
        sessionId: currentSessionId,
        fallback: true,
        error: 'fetch_failed'
      });
    }

    // Step 8: Check if webhook request was successful
    if (!webhookResponse.ok) {
      let errorDetails = `HTTP ${webhookResponse.status}`;
      try {
        const errorText = await webhookResponse.text();
        errorDetails = errorText || errorDetails;
      } catch (e) {
        // Ignore parse errors
      }
      
      // Fallback response when n8n is not available
      return Response.json({
        id: generateUUID(),
        role: 'assistant',
        content: `Recebi sua mensagem: "${message.content}". O sistema n8n está temporariamente indisponível (${errorDetails}), mas sua mensagem foi registrada.`,
        sessionId: currentSessionId,
        fallback: true,
        error: 'webhook_failed',
        status: webhookResponse.status
      });
    }

    // Step 9: Parse the response from n8n webhook
    let webhookData;
    try {
      const responseText = await webhookResponse.text();
      webhookData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse webhook response');
      return Response.json({
        id: generateUUID(),
        role: 'assistant',
        content: `Recebi sua mensagem: "${message.content}". Erro ao processar resposta do sistema n8n. Sua mensagem foi registrada.`,
        sessionId: currentSessionId,
        fallback: true,
        error: 'parse_failed'
      });
    }

    // Step 10: Return the AI assistant response to the client
    // Processar diferentes formatos de resposta do n8n
    let content = 'No response from AI agent';
    
    if (webhookData.data) {
      try {
        // Se data for uma string JSON, fazer parse
        if (typeof webhookData.data === 'string') {
          const parsedData = JSON.parse(webhookData.data);
          if (parsedData.message) {
            content = parsedData.message;
          }
        }
        // Se data já for um objeto
        else if (typeof webhookData.data === 'object' && webhookData.data.message) {
          content = webhookData.data.message;
        }
      } catch (e) {
        console.error('Erro ao fazer parse do data:', e);
      }
    } else if (webhookData.message) {
      content = webhookData.message;
    } else if (webhookData.subject) {
      content = webhookData.subject;
    } else if (webhookData.response) {
      content = webhookData.response;
    }
    
    const response = {
      id: generateUUID(),
      role: 'assistant',
      content: content,
      sessionId: currentSessionId,
    };
    
    return Response.json(response);

  } catch (error) {
    // Step 11: Handle any errors that occur during processing
    const err = error as Error;
    console.error('Chat API Error:', err.message);
    
    return Response.json(
      { 
        error: 'Failed to process chat message',
        details: err.message,
        type: err.constructor.name
      },
      { status: 500 }
    );
  }
}

// Step 12: DELETE handler for cleaning up chat sessions
export async function DELETE(request: NextRequest) {
  // Simple delete endpoint - just return success since we're not storing anything locally
  // In a real implementation, this would clear session data from external storage
  return Response.json({ success: true });
}
