import { NextRequest, NextResponse } from 'next/server';

// Interface para o payload do webhook do n8n
interface N8nWebhookPayload {
  action?: 'redirect' | 'message';
  url?: string;
  message?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp?: number;
  [key: string]: any; // Aceitar qualquer propriedade adicional
}

// Handler para requisições POST (webhook do n8n)
export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK RECEBIDO ===');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    // Validação simples de autenticação por header (opcional)
    const authHeader = request.headers.get('authorization') || request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.APP_WEBHOOK_SECRET || 'vanaci-secret-super-seguro';
    
    if (expectedSecret && authHeader !== expectedSecret) {
      console.warn('Header de autenticação inválido');
      // Mesmo assim, retornar 200 para não quebrar o n8n
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        timestamp: Date.now()
      }, { status: 200 });
    }
    
    // Obter o payload
    const payloadText = await request.text();
    console.log('Payload raw:', payloadText);
    
    // Tentar fazer parse do JSON
    let payload: N8nWebhookPayload = {};
    
    if (payloadText) {
      try {
        payload = JSON.parse(payloadText);
      } catch (parseError) {
        console.log('Erro ao fazer parse do JSON:', parseError);
        
        // Tentar extrair JSON de texto que pode conter markdown
        const jsonMatch = payloadText.match(/```json\s*({[\s\S]*?})\s*```/i) || 
                         payloadText.match(/({\s*"action"[\s\S]*?})/i);
        
        if (jsonMatch) {
          try {
            const extractedJson = jsonMatch[1].replace(/`/g, '').trim();
            const parsedAction = JSON.parse(extractedJson);
            payload = {
              action: parsedAction.action,
              url: parsedAction.url,
              message: payloadText,
              extractedAction: parsedAction
            };
            console.log('JSON extraído do markdown:', parsedAction);
          } catch (extractError) {
            console.log('Erro ao extrair JSON do markdown:', extractError);
            payload = { message: payloadText };
          }
        } else {
          payload = { message: payloadText };
        }
      }
    }
    
    console.log('Payload processado:', payload);

    // Sempre retornar sucesso para evitar erros 500
    const response = {
      success: true,
      received: true,
      payload: payload,
      timestamp: Date.now(),
      message: 'Webhook recebido com sucesso'
    };
    
    console.log('Resposta enviada:', response);
    
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    
    // Mesmo com erro, retornar 200 para não quebrar o n8n
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: Date.now()
    }, { status: 200 });
  }
}

// Handler para requisições GET (para teste)
export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint está funcionando',
    timestamp: new Date().toISOString()
  });
}