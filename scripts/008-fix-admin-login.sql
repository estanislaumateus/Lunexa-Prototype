-- Script para verificar e corrigir usuário admin
USE lunexa_dbb;

-- Verificar se o admin já existe
SELECT 'Verificando se admin existe...' as status;

SELECT id, name, email, role FROM users WHERE email = 'admin@lunexa.com';

-- Se não existir, criar o admin
INSERT INTO users (name, email, password_hash, role, created_at, updated_at) 
SELECT 'Administrador', 'admin@lunexa.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O', 'admin', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@lunexa.com');

-- Obter o ID do admin
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@lunexa.com' LIMIT 1);

-- Criar configurações se não existirem
INSERT INTO user_settings (user_id, notifications_enabled, study_reminders, assessment_alerts, achievement_notifications, weekly_reports, email_notifications, theme, font_size, compact_mode, animations, created_at, updated_at)
SELECT @admin_id, true, true, true, true, true, false, 'system', 'medium', false, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = @admin_id);

-- Verificar resultado final
SELECT 'Admin verificado/criado com sucesso!' as status;
SELECT id, name, email, role FROM users WHERE email = 'admin@lunexa.com'; 