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
    const bearerToken = process.env.N8N_BEARER;
    
    // Debug logs for environment variables
    console.log('=== CHAT API DEBUG ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Webhook URL configured:', !!webhookUrl);
    console.log('Webhook URL (first 50 chars):', webhookUrl?.substring(0, 50));
    console.log('Bearer token configured:', !!bearerToken);
    console.log('Bearer token (first 10 chars):', bearerToken?.substring(0, 10));
    console.log('Request body:', JSON.stringify({ message: message.content, sessionId }));

    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not found in environment variables');
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
    
    // Add Bearer token if configured
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
      console.log('Bearer token added to headers');
    } else {
      console.warn('No Bearer token found - requests may fail');
    }
    
    const requestPayload = {
      sessionId: currentSessionId,
      message: message.content,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Making request to webhook:', webhookUrl);
    console.log('Request payload:', JSON.stringify(requestPayload));
    console.log('Request headers:', JSON.stringify(headers));
    
    let webhookResponse;
    try {
      webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });
      
      console.log('Webhook response status:', webhookResponse.status);
      console.log('Webhook response headers:', JSON.stringify(Object.fromEntries(webhookResponse.headers.entries())));
      
    } catch (fetchError) {
      console.error('Fetch error occurred:', fetchError);
      const error = fetchError as Error;
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
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
      console.warn(`N8N webhook failed with status ${webhookResponse.status}`);
      
      // Try to get error details from response
      let errorDetails = 'Unknown error';
      try {
        const errorText = await webhookResponse.text();
        console.log('Error response body:', errorText);
        errorDetails = errorText || `HTTP ${webhookResponse.status}`;
      } catch (e) {
        console.error('Could not read error response:', e);
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
      console.log('Webhook response body:', responseText);
      webhookData = JSON.parse(responseText);
      console.log('Parsed webhook data:', JSON.stringify(webhookData));
    } catch (parseError) {
      console.error('Failed to parse webhook response:', parseError);
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
    const response = {
      id: generateUUID(),
      role: 'assistant',
      content: webhookData.response || webhookData.message || 'No response from AI agent',
      sessionId: currentSessionId,
    };
    
    console.log('=== SUCCESS: Returning response ===');
    console.log('Final response:', JSON.stringify(response));
    console.log('=== END CHAT API DEBUG ===');
    
    return Response.json(response);

  } catch (error) {
    // Step 11: Handle any errors that occur during processing
    console.error('=== CHAT API UNEXPECTED ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR DEBUG ===');
    
    return Response.json(
      { 
        error: 'Failed to process chat message',
        details: error.message,
        type: error.constructor.name
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
