# Guia Rápido: Workflow n8n para Chat AI

Como configurar um workflow no n8n para processar mensagens e redirecionar usuários.

## 📋 Visão Geral

1. **Webhook** recebe mensagens
2. **Mistral LLM** processa
3. **Lógica** decide: resposta ou redirecionamento
4. **Resposta** volta para o app

## 🔧 Configuração

### 1. Criar Workflow

- Acesse n8n → "New Workflow" → "Chat AI Agent"

### 2. Webhook Trigger

- Adicione nó "Webhook"
- Configure:
  ```
  HTTP Method: POST
  Path: /webhook/chat-ai
  Authentication: Header Auth
  Response Mode: Respond to Webhook
  ```
- Autenticação:
  ```
  Header Name: Authorization
  Header Value: Bearer seu-token-seguro
  ```

### 3. Validação (Code)

```javascript
// Validar payload
const { message, sessionId } = $node["Webhook"].json.body;
if (!message || !sessionId) {
  throw new Error("Missing fields");
}
return {
  message: message.trim(),
  sessionId,
  userId: $node["Webhook"].json.body.userId || null,
  timestamp: Date.now()
};
```

### 4. Mistral LLM (HTTP Request)

- Configurações:
  ```
  Method: POST
  URL: https://api.mistral.ai/v1/chat/completions
  ```
- Headers:
  ```
  Content-Type: application/json
  Authorization: Bearer SEU_MISTRAL_API_KEY
  ```
- Body:
  ```json
  {
    "model": "mistral-large-latest",
    "messages": [
      {
        "role": "system",
        "content": "Você é um assistente que ajuda usuários a navegar. Se pedirem para acessar uma página, responda APENAS com 'REDIRECT:URL'. Caso contrário, responda normalmente. Páginas: /produtos, /sobre, /contato, /perfil, /configuracoes"
      },
      {
        "role": "user",
        "content": "{{ $node['Code'].json.message }}"
      }
    ],
    "max_tokens": 500
  }
  ```

### 5. Processamento (Code)

```javascript
const mistralResponse = $node["HTTP Request"].json.choices[0].message.content;
const sessionId = $node["Code"].json.sessionId;

if (mistralResponse.startsWith("REDIRECT:")) {
  const url = mistralResponse.replace("REDIRECT:", "").trim();
  return {
    action: "redirect",
    url: url,
    sessionId: sessionId,
    message: `Redirecionando para ${url}`
  };
} else {
  return {
    action: "message",
    message: mistralResponse,
    sessionId: sessionId
  };
}
```

### 6. Resposta (Respond to Webhook)

```json
{
  "success": true,
  "action": "{{ $node['Code1'].json.action }}",
  "message": "{{ $node['Code1'].json.message }}",
  "url": "{{ $node['Code1'].json.url }}",
  "sessionId": "{{ $node['Code1'].json.sessionId }}"
}
```

### 7. Tratamento de Erros

- Adicione "Error Trigger" conectado a todos os nós
- Configure resposta de erro

## 🔗 Configuração no App (.env)

```env
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/chat-ai
N8N_BEARER=seu-token-seguro
```

## 📝 Exemplos

### Redirecionamento
- **Usuário:** "Quero ver os produtos"
- **Resposta:** `{"action":"redirect", "url":"/produtos"}`

### Resposta Normal
- **Usuário:** "Como funciona o site?"
- **Resposta:** `{"action":"message", "message":"Nosso site..."}`

## 🛡️ Dicas

- Use HTTPS para webhooks
- Configure autenticação
- Teste com dados reais
- Adicione mais páginas conforme necessário

---

**Nota:** Substitua `SEU_MISTRAL_API_KEY` pela sua chave real da API Mistral.