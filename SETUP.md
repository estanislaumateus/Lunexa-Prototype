# Configuração do EduSmart - Sistema Educacional Funcional

## 🚀 Configuração Rápida

### 1. Banco de Dados (Neon)

1. Acesse [Neon](https://neon.tech) e crie uma conta gratuita
2. Crie um novo projeto
3. Copie a string de conexão PostgreSQL
4. Execute os scripts SQL na ordem:
   - `scripts/001-create-database.sql`
   - `scripts/002-seed-data.sql`

### 2. APIs de IA

#### OpenAI (Recomendado)
1. Acesse [OpenAI Platform](https://platform.openai.com)
2. Crie uma conta e adicione créditos ($5 mínimo)
3. Gere uma API key
4. Adicione ao `.env`: `...`

#### Anthropic Claude (Alternativa)
1. Acesse [Anthropic Console](https://console.anthropic.com)
2. Crie uma conta e adicione créditos
3. Gere uma API key
4. Adicione ao `.env`: `...`

#### Google Gemini (Gratuito)
1. Acesse [Google AI Studio](https://aistudio.google.com)
2. Crie uma conta Google
3. Gere uma API key gratuita
4. Adicione ao `.env`: `...`

### 3. Configuração do Projeto

\`\`\`bash
# Clone o projeto
git clone <seu-repositorio>
cd edusmart-saas

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# Execute o projeto
npm run dev
\`\`\`

### 4. Funcionalidades Implementadas

✅ **Autenticação Real**
- Registro e login com bcrypt
- JWT tokens seguros
- Proteção de rotas

✅ **Banco de Dados Funcional**
- PostgreSQL com Neon
- Schema completo implementado
- Relacionamentos otimizados

✅ **IA Integrada**
- Múltiplos provedores (OpenAI, Anthropic, Google)
- Fallback automático entre IAs
- Geração de conteúdo educacional

✅ **Sistema de Estudos**
- Tópicos personalizados
- Conteúdo gerado por IA
- Tracking de progresso real
- Sessões de estudo cronometradas

✅ **Chat com IA**
- Conversas contextuais
- Histórico persistente
- Troca automática de provedores

✅ **Avaliações Funcionais**
- Questões geradas por IA
- Correção automática
- Estatísticas detalhadas

✅ **Sistema de Notificações**
- Lembretes automáticos
- Notificações de conquistas
- Configurações personalizáveis

✅ **Dashboard Completo**
- Estatísticas reais do banco
- Gráficos de progresso
- Sugestões personalizadas

## 🔧 Configurações Avançadas

### Configuração de Produção

\`\`\`bash
# Build para produção
npm run build

# Deploy no Vercel
vercel --prod

# Ou deploy no Render
# Configure as variáveis de ambiente no painel
\`\`\`

### Configuração do Banco

\`\`\`sql
-- Configurações de performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_sessions_user_date 
ON study_sessions(user_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_user_created 
ON chat_messages(user_id, created_at DESC);

-- Configurar backup automático (Neon Pro)
-- Configurar read replicas se necessário
\`\`\`

### Monitoramento

\`\`\`javascript
// lib/monitoring.ts
export function logError(error: Error, context: string) {
  console.error(`[${context}]`, error)
  // Integrar com Sentry em produção
}

export function logAIUsage(provider: string, tokens: number) {
  console.log(`AI Usage: ${provider} - ${tokens} tokens`)
  // Integrar com analytics
}
\`\`\`

## 📊 Custos Estimados

### Desenvolvimento/Teste
- **Neon Database**: Gratuito (até 512MB)
- **Google Gemini**: Gratuito (até 15 req/min)
- **Vercel Hosting**: Gratuito
- **Total**: $0/mês

### Produção (100 usuários ativos)
- **Neon Database**: $19/mês (Pro)
- **OpenAI API**: ~$20/mês
- **Vercel Pro**: $20/mês
- **Total**: ~$60/mês

## 🚨 Troubleshooting

### Erro de Conexão com Banco
\`\`\`bash
# Verificar string de conexão
echo $DATABASE_URL

# Testar conexão
npx neon-cli test-connection
\`\`\`

### Erro de API de IA
\`\`\`bash
# Verificar chaves
echo $OPENAI_API_KEY

# Testar API
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
\`\`\`

### Erro de Build
\`\`\`bash
# Limpar cache
rm -rf .next
npm run build
\`\`\`

## 📈 Próximos Passos

1. **Configurar monitoramento** (Sentry, Analytics)
2. **Implementar cache** (Redis para sessões)
3. **Adicionar testes** (Jest, Playwright)
4. **Configurar CI/CD** (GitHub Actions)
5. **Implementar PWA** (Service Workers)
6. **Adicionar pagamentos** (Stripe)

## 🆘 Suporte

- **Documentação**: [docs.edusmart.com](https://docs.edusmart.com)
- **Issues**: GitHub Issues
- **Discord**: [Comunidade EduSmart](https://discord.gg/edusmart)
- **Email**: suporte@edusmart.com
