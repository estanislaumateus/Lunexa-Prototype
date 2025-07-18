-- Script para criar usuário admin
USE lunexa_dbb;

-- Inserir usuário admin
INSERT INTO users (name, email, password_hash, role, created_at, updated_at) VALUES 
('Administrador', 'admin@lunexa.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8O', 'admin', NOW(), NOW());

-- Obter o ID do admin criado
SET @admin_id = LAST_INSERT_ID();

-- Criar configurações padrão para o admin
INSERT INTO user_settings (user_id, notifications_enabled, study_reminders, assessment_alerts, achievement_notifications, weekly_reports, email_notifications, theme, font_size, compact_mode, animations, created_at, updated_at) VALUES 
(@admin_id, true, true, true, true, true, false, 'system', 'medium', false, true, NOW(), NOW());

-- Verificar se foi criado
SELECT 'Admin criado com sucesso!' as status, @admin_id as admin_id; 