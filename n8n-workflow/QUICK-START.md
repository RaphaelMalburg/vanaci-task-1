# 🚀 Guia Rápido - Setup n8n Chat AI

## 📦 Importar Workflow

1. **Abra seu n8n**
2. **Clique em "Import from file"**
3. **Selecione o arquivo:** `chat-ai-workflow.json`
4. **Clique em "Import"**

## 🔑 Configurar Credenciais

### 1. API Mistral
1. Vá em **Settings > Credentials**
2. Clique em **"Add Credential"**
3. Selecione **"HTTP Header Auth"**
4. Configure:
   ```
   Name: mistralApi
   Header Name: Authorization
   Header Value: Bearer SEU_MISTRAL_API_KEY
   ```

### 2. Webhook Authentication
1. No nó **"Webhook Trigger"**
2. Ative **"Authentication"**
3. Selecione **"Header Auth"**
4. Configure:
   ```
   Header Name: Authorization
   Header Value: Bearer SEU_TOKEN_SEGURO
   ```

## 🌐 Configurar URLs

### 1. Webhook URL
Após importar, copie a URL do webhook:
```
https://seu-n8n.com/webhook/chat-ai
```

### 2. Configurar no App
No arquivo `.env`:
```env
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/chat-ai
N8N_BEARER=SEU_TOKEN_SEGURO
APP_WEBHOOK_SECRET=segredo_webhook_entrante
```

## ✅ Testar

### 1. Teste Manual no n8n
1. Clique em **"Execute Workflow"**
2. Use dados de teste:
   ```json
   {
     "message": "Quero ver os produtos",
     "sessionId": "test_123"
   }
   ```

### 2. Teste no App
1. Inicie o app: `npm run dev`
2. Digite: "Quero acessar a página de produtos"
3. Verifique se redireciona corretamente

## 🔧 Personalizar

### Adicionar Novas Páginas
No nó **"Mistral LLM"**, edite o prompt:
```
Páginas disponíveis: /produtos, /sobre, /contato, /perfil, /configuracoes, /nova-pagina
```

### Ajustar Comportamento
Modifique o prompt do sistema no nó **"Mistral LLM"** conforme necessário.

## 🐛 Troubleshooting

- **Erro 401:** Verifique o Bearer token no webhook
- **Erro 500:** Verifique a API key do Mistral
- **Sem resposta:** Verifique a URL do webhook
- **Redirecionamento não funciona:** Verifique o formato da resposta
- **Token inválido:** Certifique-se que o Bearer token é o mesmo no app e no n8n

## 📞 Suporte

Consulte o arquivo `README-n8n-setup.md` para instruções detalhadas.