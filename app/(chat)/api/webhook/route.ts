import { NextRequest, NextResponse } from 'next/server';
import { validateWebhook } from '@/lib/webhook-security';

// Interface para o payload do webhook do n8n
interface N8nWebhookPayload {
  action: 'redirect' | 'message';
  url?: string;
  message?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp?: number;
}

// Handler para requisições POST (webhook do n8n)
export async function POST(request: NextRequest) {
  try {
    // Obter o payload como texto para validação
    const payloadText = await request.text();
    
    // Validar webhook com segurança aprimorada
    const validationResult = validateWebhook(
      request.headers,
      payloadText,
      {
        secret: process.env.APP_WEBHOOK_SECRET,
        maxAge: 300, // 5 minutos
        allowedIPs: process.env.ALLOWED_IPS?.split(',').filter(ip => ip.trim()) || []
      }
    );
    
    if (!validationResult.isValid) {
      console.warn('Webhook validation failed:', validationResult.error);
      return NextResponse.json(
        { error: `Unauthorized: ${validationResult.error}` },
        { status: 401 }
      );
    }

    // Parse do payload
    const payload: N8nWebhookPayload = JSON.parse(payloadText);
    
    console.log('Webhook recebido do n8n:', payload);

    // Processar diferentes tipos de ação
    switch (payload.action) {
      case 'redirect':
        if (!payload.url) {
          return NextResponse.json(
            { error: 'URL é obrigatória para redirecionamento' },
            { status: 400 }
          );
        }
        
        // Validar URL (básico)
        try {
          new URL(payload.url);
        } catch {
          return NextResponse.json(
            { error: 'URL inválida' },
            { status: 400 }
          );
        }
        
        // Retornar instrução de redirecionamento
        return NextResponse.json({
          success: true,
          action: 'redirect',
          url: payload.url,
          message: `Redirecionando para: ${payload.url}`,
          timestamp: Date.now()
        });
        
      case 'message':
        if (!payload.message) {
          return NextResponse.json(
            { error: 'Mensagem é obrigatória' },
            { status: 400 }
          );
        }
        
        // Sanitizar mensagem (básico)
        const sanitizedMessage = payload.message.trim().substring(0, 1000);
        
        // Retornar mensagem para o chat
        return NextResponse.json({
          success: true,
          action: 'message',
          message: sanitizedMessage,
          sessionId: payload.sessionId,
          timestamp: Date.now()
        });
        
      default:
        return NextResponse.json(
          { error: 'Ação não suportada' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Handler para requisições GET (para teste)
export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint está funcionando',
    timestamp: new Date().toISOString()
  });
}