# Lunexa - Plataforma de Estudos Inteligente

## 📋 Visão Geral

Lunexa é uma plataforma de estudos inteligente desenvolvida para Angola, focada no currículo do ensino médio. O sistema oferece trilhas de estudo personalizadas, assistentes de IA e conteúdo educacional adaptativo.

## 🏗️ Arquitetura do Sistema

### Tecnologias Utilizadas
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Banco de Dados**: MySQL
- **Autenticação**: JWT (JSON Web Tokens)
- **IA**: Integração com múltiplos provedores (Cohere, Google, Anthropic)

### Estrutura de Diretórios
```
lunexa/
├── app/                    # App Router do Next.js
│   ├── actions/           # Server Actions
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard do usuário
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   └── onboarding/        # Onboarding do usuário
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── auth/             # Componentes de autenticação
│   ├── dashboard/        # Componentes do dashboard
│   └── layout/           # Componentes de layout
├── lib/                  # Utilitários e configurações
├── scripts/              # Scripts SQL
└── public/               # Arquivos estáticos
```

## 🔐 Sistema de Autenticação

### Controle de Credenciais
- **Localização**: `lib/auth.ts`
- **Método**: JWT (JSON Web Tokens)
- **Hash de Senhas**: bcrypt com salt de 12 rounds
- **Duração do Token**: 7 dias

### Fluxo de Autenticação
1. **Login**: `app/actions/auth.ts` - `loginAction()`
2. **Registro**: `app/actions/auth.ts` - `registerAction()`
3. **Verificação**: `lib/auth.ts` - `getCurrentUser()`
4. **Logout**: `app/actions/auth.ts` - `logoutAction()`

### Proteção de Rotas
- **Middleware**: Verificação automática de token em todas as rotas protegidas
- **Admin Routes**: Verificação adicional de role 'admin'
- **API Routes**: Autenticação via cookies

## 📚 Sistema de Cursos e Disciplinas

### Estrutura Hierárquica
```
Curso (courses)
├── Disciplina (disciplines)
    ├── Tópicos de Estudo (study_topics)
        ├── Sessões de Estudo (study_sessions)
        └── Avaliações (assessments)
```

### Controle de Acesso
- **Usuários**: Só podem acessar tópicos das disciplinas do seu curso
- **Filtro**: Implementado em `app/actions/study.ts` - `getStudyTopics()`
- **Associação**: Campo `course_id` na tabela `users`

### Gestão Administrativa
- **Localização**: `app/admin/courses/page.tsx`
- **Funcionalidades**:
  - Criar/editar cursos
  - Adicionar disciplinas
  - Gerenciar tópicos
  - Visualizar estatísticas

## 🧠 Sistema de IA

### Provedores de IA
- **Cohere**: Principal provedor
- **Google**: Fallback
- **Anthropic**: Fallback secundário

### Funcionalidades de IA
1. **Geração de Conteúdo**: `lib/ai.ts` - `generateEducationalContent()`
2. **Questões de Avaliação**: `lib/ai.ts` - `generateAssessmentQuestions()`
3. **Sugestões de Estudo**: `lib/ai.ts` - `suggestStudyTopics()`
4. **Chat Inteligente**: `lib/ai.ts` - `chatWithAI()`

### Rotação de Provedores
- **Limite**: 20 mensagens por provedor
- **Fallback**: Automático em caso de erro
- **Contexto**: Mantido entre trocas de provedor

## 📊 Sistema de Avaliações

### Estrutura
- **Avaliações**: Tabela `assessments`
- **Resultados**: Tabela `assessment_results`
- **Questões**: Armazenadas como JSON na tabela `assessments`

### Funcionalidades
1. **Avaliações Padrão**: Pré-criadas no sistema
2. **Avaliações Personalizadas**: Geradas por IA baseadas em tópicos
3. **Correção Automática**: Cálculo de pontuação e estatísticas
4. **Histórico**: Rastreamento de todas as tentativas

### APIs
- **GET /api/assessments**: Listar avaliações
- **POST /api/assessments**: Criar avaliação personalizada
- **Server Actions**: `app/actions/assessments.ts`

## 📈 Sistema de Monitoramento

### Métricas Rastreadas
- **Tempo de Estudo**: Por sessão e total
- **Progresso**: Porcentagem de conclusão por tópico
- **Avaliações**: Notas, tentativas, taxa de acerto
- **Engajamento**: Frequência de uso, sessões ativas

### Cronômetro de Leitura
- **Tempo Mínimo**: Configurável por tópico
- **Bloqueio**: Usuário não pode avançar sem atingir tempo mínimo
- **Opção "Já Conheço"**: Permite pular, mas exige avaliação
- **Nota Mínima**: 70% para aprovação

## 🔔 Sistema de Notificações

### Tipos de Notificação
- **Reminder**: Lembretes de estudo
- **Assessment**: Resultados de avaliações
- **Achievement**: Conquistas e marcos
- **System**: Notificações do sistema
- **Feedback**: Confirmação de feedback enviado

### Armazenamento
- **Tabela**: `notifications`
- **Metadados**: JSON para informações adicionais
- **Status**: Lida/não lida

## 💬 Sistema de Feedback

### Funcionalidades
- **Tipos**: Bug, Sugestão, Geral
- **Categorias**: Interface, Conteúdo, Performance, etc.
- **Prioridades**: Baixa, Média, Alta, Crítica
- **Avaliação**: Sistema de 5 estrelas

### Fluxo
1. **Envio**: `app/dashboard/feedback/page.tsx`
2. **Processamento**: `app/api/feedback/route.ts`
3. **Armazenamento**: Tabela `feedback`
4. **Notificação**: Confirmação para usuário e alerta para admin

## 🎨 Interface e UX

### Design System
- **Framework**: shadcn/ui
- **Estilo**: Tailwind CSS
- **Tema**: Suporte a modo claro/escuro
- **Responsividade**: Mobile-first

### Componentes Principais
- **Layout**: `components/layout/`
- **Dashboard**: `components/dashboard/`
- **Formulários**: `components/ui/`
- **Navegação**: Sidebar responsiva

## 🗄️ Banco de Dados

### Tabelas Principais
1. **users**: Usuários do sistema
2. **courses**: Cursos disponíveis
3. **disciplines**: Disciplinas dos cursos
4. **study_topics**: Tópicos de estudo
5. **study_sessions**: Sessões de estudo
6. **assessments**: Avaliações
7. **assessment_results**: Resultados
8. **chat_messages**: Mensagens do chat
9. **notifications**: Notificações
10. **feedback**: Feedback dos usuários
11. **user_settings**: Configurações do usuário

### Scripts SQL
- `001-create-database.sql`: Estrutura base
- `002-seed-data.sql`: Dados iniciais
- `003-add-schedule-table.sql`: Tabela de agenda
- `004-add-courses-and-disciplines.sql`: Sistema de cursos
- `005-seed-informatics-course.sql`: Curso de Informática
- `006-add-feedback-table.sql`: Sistema de feedback

## 🔧 Configuração e Deploy

### Variáveis de Ambiente
```env
DATABASE_URL=mysql://user:password@localhost:3306/lunexa_dbb
JWT_SECRET=your-secret-key-change-in-production
COHERE_API_KEY=your-cohere-api-key
GOOGLE_API_KEY=your-google-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Instalação
1. **Dependências**: `npm install`
2. **Banco de Dados**: Executar scripts SQL em ordem
3. **Variáveis**: Configurar `.env.local`
4. **Desenvolvimento**: `npm run dev`
5. **Produção**: `npm run build && npm start`

## 🚀 APIs e Endpoints

### Autenticação
- `POST /api/auth/login`: Login
- `POST /api/auth/register`: Registro
- `POST /api/auth/logout`: Logout

### Estudos
- `GET /api/study/topics`: Listar tópicos
- `POST /api/study/sessions`: Iniciar sessão
- `PUT /api/study/sessions`: Finalizar sessão

### Avaliações
- `GET /api/assessments`: Listar avaliações
- `POST /api/assessments`: Criar avaliação
- `POST /api/assessments/submit`: Submeter resultado

### Chat
- `POST /api/chat`: Enviar mensagem
- `GET /api/chat/history`: Histórico

### Admin
- `GET /api/admin/courses`: Listar cursos
- `POST /api/admin/courses`: Criar curso
- `GET /api/admin/courses/[id]/disciplines`: Disciplinas do curso
- `POST /api/admin/courses/[id]/disciplines`: Criar disciplina

### Feedback
- `POST /api/feedback`: Enviar feedback

## 🔒 Segurança

### Medidas Implementadas
- **Hash de Senhas**: bcrypt com salt
- **JWT**: Tokens seguros com expiração
- **Validação**: Zod schemas para todos os inputs
- **SQL Injection**: Prepared statements
- **XSS**: Sanitização de inputs
- **CSRF**: Proteção via cookies httpOnly

### Controle de Acesso
- **Roles**: user/admin
- **Verificação**: Middleware em todas as rotas
- **Isolamento**: Usuários só veem seus dados

## 📱 Funcionalidades Mobile

### Responsividade
- **Design**: Mobile-first
- **Componentes**: Adaptáveis a diferentes telas
- **Navegação**: Sidebar colapsável
- **Touch**: Otimizado para toque

## 🔄 Fluxos Principais

### Registro de Usuário
1. Preenchimento do formulário com curso e turma
2. Validação de email único
3. Hash da senha
4. Criação do usuário e configurações padrão
5. Redirecionamento para onboarding

### Sessão de Estudo
1. Seleção de tópico
2. Início da sessão com cronômetro
3. Leitura do conteúdo
4. Opção de marcar como "já conheço"
5. Avaliação obrigatória se marcado
6. Finalização e registro de progresso

### Criação de Avaliação
1. Seleção de tópico
2. Geração de questões por IA
3. Configuração de dificuldade
4. Salvamento no banco
5. Disponibilização para o usuário

## 🛠️ Manutenção e Monitoramento

### Logs
- **Erros**: Console e arquivos de log
- **Performance**: Métricas de tempo de resposta
- **Uso**: Estatísticas de usuários ativos

### Backup
- **Banco de Dados**: Backup automático recomendado
- **Arquivos**: Versionamento via Git
- **Configurações**: Variáveis de ambiente

## 📈 Métricas e Analytics

### Dados Coletados
- **Engajamento**: Tempo de sessão, frequência
- **Performance**: Taxa de conclusão, notas
- **Feedback**: Avaliações, sugestões
- **Uso**: Funcionalidades mais utilizadas

### Relatórios
- **Admin**: Dashboard com estatísticas gerais
- **Usuário**: Progresso pessoal
- **Sistema**: Métricas de performance

## 🔮 Roadmap e Melhorias

### Próximas Funcionalidades
- [ ] Sistema de gamificação
- [ ] Integração com calendário
- [ ] Notificações push
- [ ] Modo offline
- [ ] Integração com LMS
- [ ] Analytics avançados

### Otimizações
- [ ] Cache de conteúdo
- [ ] Lazy loading
- [ ] PWA (Progressive Web App)
- [ ] CDN para assets
- [ ] Otimização de queries

## 📞 Suporte e Contato

### Documentação
- **README.md**: Guia de instalação
- **SETUP.md**: Configuração detalhada
- **INFO.md**: Este arquivo

### Comunicação
- **Feedback**: Sistema integrado na plataforma
- **Issues**: GitHub Issues
- **Email**: [email de contato]

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Desenvolvido para**: Angola  
**Licença**: [Tipo de licença] 