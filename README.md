# Chat Simples com n8n

<p align="center">
    Uma aplicação de chat simples construída com Next.js que se conecta a um webhook do n8n para processamento de mensagens.
</p>

## Sobre o Projeto

Esta é uma aplicação de chat simplificada que foi desenvolvida para demonstrar a integração entre uma interface web moderna e o n8n (uma ferramenta de automação de fluxo de trabalho). A aplicação permite que os usuários enviem mensagens através de uma interface de chat limpa e intuitiva, que são então processadas por um webhook do n8n.

## Características Principais

- **Interface de Chat Simples**: Interface de usuário limpa e responsiva construída com Next.js e Tailwind CSS
- **Integração com n8n**: Conecta-se diretamente a um webhook do n8n para processamento de mensagens
- **Gerenciamento de Sessão**: Cada conversa possui um ID de sessão único para rastreamento
- **Design Responsivo**: Funciona perfeitamente em dispositivos desktop e móveis
- **Componentes Modernos**: Utiliza componentes UI do shadcn/ui para uma experiência consistente

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org) - Framework React para aplicações web
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS utilitário
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI reutilizáveis
- [Framer Motion](https://framer.com/motion) - Biblioteca de animações
- [n8n](https://n8n.io) - Plataforma de automação de fluxo de trabalho

## Como Funciona

1. **Interface do Usuário**: Os usuários digitam suas mensagens na interface de chat
2. **Envio de Mensagem**: As mensagens são enviadas para a API interna da aplicação
3. **Processamento n8n**: A API encaminha as mensagens para um webhook do n8n configurado
4. **Resposta**: O n8n processa a mensagem e retorna uma resposta
5. **Exibição**: A resposta é exibida na interface de chat

## Configuração

Para executar esta aplicação, você precisará:

1. **Configurar as variáveis de ambiente**:
   ```bash
   cp .env.example .env
   ```
   
2. **Definir a URL do webhook do n8n**:
   ```
   N8N_WEBHOOK_URL=https://seu-n8n-instance.com/webhook/chat
   ```

3. **Instalar as dependências**:
   ```bash
   npm install
   ```

4. **Executar em modo de desenvolvimento**:
   ```bash
   npm run dev
   ```

## Estrutura do Projeto

- `/app` - Páginas e rotas da aplicação Next.js
- `/components` - Componentes React reutilizáveis
- `/lib` - Utilitários e configurações
- `/public` - Arquivos estáticos

## Personalização

Esta aplicação foi projetada para ser facilmente personalizável:

- **Estilo**: Modifique os estilos em `app/globals.css` ou nos componentes individuais
- **Componentes**: Adicione ou modifique componentes na pasta `/components`
- **Lógica de Chat**: Ajuste a lógica de processamento de mensagens em `/app/(chat)/api/chat/route.ts`

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Nota**: Esta é uma versão simplificada de uma aplicação de chat, focada na demonstração da integração com n8n. Para uso em produção, considere adicionar recursos como autenticação, persistência de dados e tratamento de erros mais robusto.
