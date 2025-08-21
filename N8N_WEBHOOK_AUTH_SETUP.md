# Configuração de Autenticação do Webhook n8n

⚠️ **IMPORTANTE**: O workflow `workflow-chat-ai.json` já está configurado para usar autenticação por header (`headerAuth`), mas você precisa configurar as credenciais correspondentes no n8n para que funcione corretamente.

## Status da Configuração

✅ **Já configurado no workflow JSON:**
- `"authentication": "headerAuth"` no nó Webhook Trigger
- Referência às credenciais `"httpHeaderAuth"` com ID `"webhook-auth"`

❌ **Ainda precisa ser configurado no n8n:**
- Criar as credenciais de autenticação por header
- Configurar o token Bearer correto

## Visão Geral
O workflow do n8n agora inclui autenticação por header para maior segurança. Este documento explica como configurar a autenticação.

## Passos para Configuração

### 1. Criar Credencial de Autenticação por Header

1. No n8n, vá para **Settings** > **Credentials**
2. Clique em **Add Credential**
3. Selecione **HTTP Header Auth**
4. Configure:
   - **Name**: `Webhook Authentication`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer vanaci-token-super-seguro`

### 2. Aplicar Credencial ao Webhook

1. Abra o workflow `workflow-chat-ai-corrigido-final`
2. Clique no nó **Webhook Trigger**
3. Na seção **Credentials**, selecione a credencial criada: `Webhook Authentication`
4. Salve o workflow

### 3. Testar a Autenticação

Após configurar, teste o webhook enviando uma requisição com o header:
```
Authorization: Bearer vanaci-token-super-seguro
```

### 4. Atualizar Código da Aplicação

Certifique-se de que o código da aplicação Next.js está enviando o header correto:

```typescript
// Em hooks/use-n8n-integration.tsx
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_N8N_BEARER}`
};
```

### 5. Variáveis de Ambiente

Configure no arquivo `.env.local`:
```
NEXT_PUBLIC_N8N_BEARER=vanaci-token-super-seguro
```

## Segurança

- O token `vanaci-token-super-seguro` deve ser mantido em segredo
- Em produção, use um token mais complexo e único
- Considere rotacionar o token periodicamente

## Troubleshooting

### Erro 401 Unauthorized
- Verifique se a credencial está corretamente configurada
- Confirme que o header `Authorization` está sendo enviado
- Verifique se o token está correto

### Webhook não recebe requisições
- Confirme que o workflow está ativo
- Verifique se a URL do webhook está correta
- Teste primeiro sem autenticação para isolar o problema