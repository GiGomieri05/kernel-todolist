# K.E.R.N.E.L. Todo List

Sistema de escalonador de tarefas pessoal que combina **Google Calendar** (janelas de horário) + **Todoist** (backlog de tarefas) + **IA (Groq/Llama)** para organizar automaticamente o que fazer e quando fazer.

## Stack

- **Frontend + Backend:** Next.js 16 (App Router)
- **Auth + DB:** Firebase Auth + Firestore
- **IA:** Groq API (Llama 3.3 70B Versatile)
- **Integrações:** Google Calendar API, Todoist REST API v2
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Timezone:** America/Sao_Paulo (hardcoded)
- **Idioma:** Português brasileiro

## Funcionalidades Implementadas

### Fase 1 - Setup + Autenticação ✅
- Autenticação Firebase com Email/Password
- Sessão via cookies (5 dias)
- Middleware de proteção de rotas
- Layout com header e sidebar
- Tema dark (zinc-950)

### Fase 2 - Google Calendar ✅
- OAuth2 com Google
- Leitura de eventos/janelas
- Cache no Firestore (10 minutos)
- Seleção de calendários
- Lista de janelas do dia

### Fase 3 - Todoist + Mapeamento ✅
- API client para Todoist
- Cache de projetos, labels e tarefas
- Mapeamento Janela → Projeto
- Associação automática de tarefas às janelas
- API routes para CRUD de tarefas

### Fase 4 - UI Timeline ✅
- Visualização em timeline
- Estados visuais (passada, atual, futura)
- Navegação entre dias
- Indicador "agora"
- Tarefas flutuantes vs com horário
- Tarefas sem janela (órfãs)

### Fase 5 - IA (Groq) 🚧 (Estrutura base)
- Provider de IA abstrato
- Integração Groq SDK
- API route `/api/ai/parse-task`
- System prompt configurado
- Logging de interações

### Fase 6 - Reagendamento 🚧 (Não implementado)
- Detecção de tarefas atrasadas
- Sugestão de próximas janelas
- Reagendamento manual
- Histórico de reagendamentos

## Como Executar

1. **Clone o repositório:**
```bash
git clone <repo-url>
cd kernel-todolist
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
Copie `.env.example` para `.env.local` e preencha:

```env
# Groq
GROQ_API_KEY=sua-chave-aqui
GROQ_MODEL=llama-3.3-70b-versatile

# Firebase (cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...

# Google Calendar OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Todoist
TODOIST_API_TOKEN=seu-token-aqui

# App
NEXTAUTH_SECRET=qualquer-string-secreta
NEXTAUTH_URL=http://localhost:3000
APP_TIMEZONE=America/Sao_Paulo
```

4. **Configure o Firebase:**
- Crie um projeto em https://console.firebase.google.com
- Habilite Authentication (Email/Password)
- Crie um banco Firestore
- Baixe as credenciais do Admin SDK (Service Accounts > Generate new private key)

5. **Configure o Google OAuth:**
- Vá em https://console.cloud.google.com/apis/credentials
- Crie credenciais OAuth 2.0
- Adicione redirect URI: `http://localhost:3000/api/auth/google/callback`
- Habilite Google Calendar API

6. **Configure o Todoist:**
- Vá em https://todoist.com/app/settings/integrations/developer
- Gere um token de API

7. **Execute o servidor de desenvolvimento:**
```bash
npm run dev
```

8. **Acesse:**
http://localhost:3000

9. **Crie um usuário:**
No Firebase Console > Authentication, crie um usuário manualmente para login.

## Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   │   └── login/
│   ├── (app)/             # Rotas protegidas (app)
│   │   ├── page.tsx       # Home (timeline)
│   │   └── settings/      # Configurações
│   └── api/               # API routes
│       ├── auth/
│       ├── calendar/
│       ├── todoist/
│       └── ai/
├── components/
│   ├── ui/                # shadcn/ui
│   ├── layout/            # AppHeader, AppSidebar
│   └── timeline/          # DayHeader, WindowCard, TaskItem
├── hooks/                 # React hooks
│   ├── useAuth.tsx
│   ├── useCalendar.ts
│   ├── useTodoist.ts
│   └── useMappings.ts
├── lib/                   # Lógica de negócio
│   ├── firebase/          # Client/Admin SDK
│   ├── google/            # Calendar API
│   ├── todoist/           # Todoist API
│   ├── ai/                # Providers de IA
│   ├── mappings.ts        # Mapeamento janela→projeto
│   └── timeline.ts        # Lógica de timeline
└── types/                 # TypeScript types
```

## Roadmap

- [x] Fase 1: Setup + Autenticação
- [x] Fase 2: Google Calendar
- [x] Fase 3: Todoist + Mapeamento
- [x] Fase 4: UI Timeline
- [ ] Fase 5: IA para criação de tarefas (estrutura base)
- [ ] Fase 6: Reagendamento inteligente
- [ ] Deploy na Vercel
- [ ] Documentação completa

## Licença

MIT

---

Desenvolvido com ❤️ usando Next.js, Firebase e Groq.
