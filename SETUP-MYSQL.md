# Configuração do EduSmart com MySQL

## 🗄️ Configuração do Banco MySQL

### Opção 1: MySQL Local
\`\`\`bash
# Instalar MySQL
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS (Homebrew)
brew install mysql
brew services start mysql

# Windows
# Baixar MySQL Installer do site oficial

# Configurar banco
mysql -u root -p
CREATE DATABASE edusmart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'edusmart'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON edusmart_db.* TO 'edusmart'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

### Opção 2: MySQL na Nuvem (Recomendado)

#### PlanetScale (Gratuito)
1. Acesse [PlanetScale](https://planetscale.com)
2. Crie uma conta gratuita
3. Crie um novo banco de dados
4. Copie a string de conexão
5. Configure no `.env`: `DATABASE_URL="mysql://..."`

#### Railway (Gratuito)
1. Acesse [Railway](https://railway.app)
2. Crie uma conta com GitHub
3. Crie um novo projeto MySQL
4. Copie a string de conexão

#### Aiven (Gratuito por 1 mês)
1. Acesse [Aiven](https://aiven.io)
2. Crie uma conta gratuita
3. Crie um serviço MySQL
4. Configure a string de conexão

## 🚀 Configuração do Projeto

\`\`\`bash
# Clone e configure
git clone <seu-repositorio>
cd edusmart-saas

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# Execute os scripts SQL
# Conecte ao seu banco MySQL e execute:
# 1. scripts/001-create-database.sql
# 2. scripts/002-seed-data.sql

# Execute o projeto
npm run dev
\`\`\`

## 📊 Diferenças MySQL vs PostgreSQL

### Vantagens do MySQL:
✅ **Mais Popular**: Maior comunidade e recursos
✅ **Performance**: Excelente para leitura intensiva
✅ **Simplicidade**: Mais fácil de configurar
✅ **Compatibilidade**: Funciona em qualquer lugar
✅ **Custo**: Opções gratuitas abundantes

### Funcionalidades Implementadas:
✅ **JSON Support**: Campos JSON nativos
✅ **Índices Otimizados**: Performance garantida
✅ **Transações ACID**: Consistência de dados
✅ **Foreign Keys**: Integridade referencial
✅ **Auto Increment**: IDs automáticos
✅ **UTF8MB4**: Suporte completo a Unicode

## 🔧 Comandos Úteis MySQL

\`\`\`sql
-- Verificar status do banco
SHOW DATABASES;
USE edusmart_db;
SHOW TABLES;

-- Verificar dados
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM study_topics;
SELECT COUNT(*) FROM assessments;

-- Backup do banco
mysqldump -u username -p edusmart_db > backup.sql

-- Restaurar backup
mysql -u username -p edusmart_db < backup.sql

-- Verificar performance
SHOW PROCESSLIST;
EXPLAIN SELECT * FROM study_sessions WHERE user_id = 1;
\`\`\`

## 🚨 Troubleshooting MySQL

### Erro de Conexão
\`\`\`bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Reiniciar MySQL
sudo systemctl restart mysql

# Verificar logs
sudo tail -f /var/log/mysql/error.log
\`\`\`

### Erro de Charset
\`\`\`sql
-- Verificar charset
SHOW VARIABLES LIKE 'character_set%';

-- Corrigir se necessário
ALTER DATABASE edusmart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

### Erro de Timezone
\`\`\`sql
-- Configurar timezone
SET time_zone = '+00:00';
\`\`\`

## 💰 Custos MySQL na Nuvem

### Desenvolvimento (Gratuito)
- **PlanetScale**: 1GB gratuito
- **Railway**: $5 crédito inicial
- **Aiven**: 1 mês gratuito
- **Total**: $0/mês

### Produção (100 usuários)
- **PlanetScale Pro**: $29/mês
- **Railway Pro**: $20/mês  
- **AWS RDS**: $15-30/mês
- **Total**: $15-30/mês

## 🎯 Próximos Passos

1. **Configurar banco MySQL** (local ou nuvem)
2. **Executar scripts SQL** fornecidos
3. **Configurar APIs de IA** (OpenAI, Google, etc.)
4. **Testar todas as funcionalidades**
5. **Deploy em produção**

O sistema está **100% compatível com MySQL** e pronto para uso!
