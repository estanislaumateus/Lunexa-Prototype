-- Apaga todos os usuários exceto o admin principal e o usuário estanislaujr12@gmail.com
DELETE FROM users WHERE email NOT IN ('admin@lunexa.com', 'estanislaujr12@gmail.com');

-- Limpa dados relacionados de usuários que não existem mais
DELETE FROM user_settings WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM study_topics WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM study_sessions WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM assessment_results WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM notifications WHERE user_id NOT IN (SELECT id FROM users);

-- Garante que o campo password_hash é VARCHAR(255)
ALTER TABLE users MODIFY password_hash VARCHAR(255) NOT NULL;

-- Remove o admin antigo (se quiser garantir que será recriado do zero)
DELETE FROM users WHERE email = 'admin@lunexa.com';

-- Cria o admin com hash de senha gerado pelo bcrypt (hash fornecido pelo usuário)
INSERT INTO users (name, email, password_hash, role, study_goal, difficulty_level, preferred_subjects, email_verified, created_at, updated_at)
VALUES ('Administrador', 'admin@lunexa.com', '$2b$12$dQUyZfcy8tiEmSQI6mISSu2q8eKMTSWPC5gDQov9aA6LSFcnQSenW', 'admin', 0, 'Básico', '[]', 1, NOW(), NOW());

-- Cria configurações padrão para o admin e para o usuário estanislaujr12@gmail.com
INSERT INTO user_settings (user_id)
SELECT id FROM users WHERE email IN ('admin@lunexa.com', 'estanislaujr12@gmail.com')
AND id NOT IN (SELECT user_id FROM user_settings); 