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
      return Response.json(
        { error: 'N8N webhook URL not configured ,' },
        { status: 500 }
      );
    }

    // Step 6: Generate a unique session ID if not provided
    const currentSessionId = sessionId || generateUUID();

    // Step 7: Send user message to n8n webhook for processing
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: currentSessionId,
        message: message.content,
        timestamp: new Date().toISOString(),
      }),
    });

    // Step 8: Check if webhook request was successful
    if (!webhookResponse.ok) {
      throw new Error(`Webhook request failed: ${webhookResponse.status}`);
    }

    // Step 9: Parse the response from n8n webhook
    const webhookData = await webhookResponse.json();

    // Step 10: Return the AI assistant response to the client
    return Response.json({
      id: generateUUID(),
      role: 'assistant',
      content: webhookData.response || webhookData.message || 'No response from AI agent',
      sessionId: currentSessionId,
    });

  } catch (error) {
    // Step 11: Handle any errors that occur during processing
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process chat message' },
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
