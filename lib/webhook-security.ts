import crypto from 'crypto';

// Interface para configurações de segurança do webhook
interface WebhookSecurityConfig {
  secret?: string;
  allowedIPs?: string[];
  maxAge?: number; // em segundos
}

// Função para validar segredo do webhook
export function validateWebhookSecret(receivedSecret: string | null, expectedSecret?: string): boolean {
  if (!expectedSecret) {
    console.warn('APP_WEBHOOK_SECRET não configurado');
    return false;
  }
  
  if (!receivedSecret) {
    return false;
  }
  
  // Comparação segura para evitar timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(receivedSecret),
    Buffer.from(expectedSecret)
  );
}

// Função para validar assinatura HMAC (opcional, para maior segurança)
export function validateHMACSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }
  
  // Remover prefixo 'sha256=' se presente
  const cleanSignature = signature.replace(/^sha256=/, '');
  
  // Calcular HMAC esperado
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Comparação segura
  return crypto.timingSafeEqual(
    Buffer.from(cleanSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Função para validar IP de origem (opcional)
export function validateSourceIP(clientIP: string, allowedIPs: string[]): boolean {
  if (allowedIPs.length === 0) {
    return true; // Se não há restrições de IP, permitir todos
  }
  
  return allowedIPs.includes(clientIP);
}

// Função para validar timestamp (prevenir replay attacks)
export function validateTimestamp(timestamp: string | number, maxAge: number = 300): boolean {
  const now = Math.floor(Date.now() / 1000);
  const webhookTime = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  
  if (isNaN(webhookTime)) {
    return false;
  }
  
  // Verificar se o timestamp não é muito antigo
  return (now - webhookTime) <= maxAge;
}

// Função principal para validar webhook
export function validateWebhook(
  headers: Headers,
  payload: string,
  config: WebhookSecurityConfig
): { isValid: boolean; error?: string } {
  // Validar segredo básico
  const secret = headers.get('x-webhook-secret');
  if (!validateWebhookSecret(secret, config.secret)) {
    return { isValid: false, error: 'Invalid webhook secret' };
  }
  
  // Validar assinatura HMAC se configurada
  const signature = headers.get('x-hub-signature-256');
  if (signature && config.secret) {
    if (!validateHMACSignature(payload, signature, config.secret)) {
      return { isValid: false, error: 'Invalid HMAC signature' };
    }
  }
  
  // Validar timestamp se presente
  const timestamp = headers.get('x-webhook-timestamp');
  if (timestamp && config.maxAge) {
    if (!validateTimestamp(timestamp, config.maxAge)) {
      return { isValid: false, error: 'Webhook timestamp too old' };
    }
  }
  
  // Validar IP de origem se configurado
  const clientIP = headers.get('x-forwarded-for') || headers.get('x-real-ip');
  if (config.allowedIPs && clientIP) {
    if (!validateSourceIP(clientIP, config.allowedIPs)) {
      return { isValid: false, error: 'IP not allowed' };
    }
  }
  
  return { isValid: true };
}

// Função para gerar assinatura HMAC (para testes)
export function generateHMACSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}