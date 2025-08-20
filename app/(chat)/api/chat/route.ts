import { NextRequest } from 'next/server';
import { generateUUID } from '@/lib/utils';

export const maxDuration = 60;

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

export async function POST(request: NextRequest) {
  try {
    const body: PostRequestBody = await request.json();
    const { message, sessionId } = body;

    // Get n8n webhook URL from environment
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return Response.json(
        { error: 'N8N webhook URL not configured' },
        { status: 500 }
      );
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || generateUUID();

    // Send request to n8n webhook
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

    if (!webhookResponse.ok) {
      throw new Error(`Webhook request failed: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();

    // Return the response from n8n
    return Response.json({
      id: generateUUID(),
      role: 'assistant',
      content: webhookData.response || webhookData.message || 'No response from AI agent',
      sessionId: currentSessionId,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Simple delete endpoint - just return success since we're not storing anything
  return Response.json({ success: true });
}
