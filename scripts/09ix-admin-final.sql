-- Script final para corrigir o admin
USE lunexa_dbb;

--1rificar se o admin existe
SELECT Verificando admin atual...' as status;
SELECT id, name, email, role, LENGTH(password_hash) as hash_length FROM users WHERE email =admin@lunexa.com';

-- 2. Atualizar o hash do admin com o valor correto
UPDATE users SET password_hash =$2$12nhr5yN0IN.emEK99Za/MYOIg0Etq.q05W2kXahEVglshm9RtAAe6ERE email =admin@lunexa.com';

-- 3. Verificar se foi atualizado
SELECTAdmin atualizado!' as status;
SELECT id, name, email, role, LENGTH(password_hash) as hash_length FROM users WHERE email =admin@lunexa.com';

-- 4ar se as configurações do admin existem
SELECT 'Verificando configurações do admin...' as status;
SELECT * FROM user_settings WHERE user_id = (SELECT id FROM users WHERE email =admin@lunexa.com');

-- 5riar configurações se não existirem
INSERT INTO user_settings (user_id, notifications_enabled, study_reminders, assessment_alerts, achievement_notifications, weekly_reports, email_notifications, theme, font_size, compact_mode, animations, created_at, updated_at)
SELECT 
    (SELECT id FROM users WHERE email =admin@lunexa.com),
    true, true, true, true, true, false,system, 'medium', false, true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM user_settings WHERE user_id = (SELECT id FROM users WHERE email =admin@lunexa.com')
);

-- 6. Verificar resultado final
SELECT '✅ Admin configurado com sucesso!' as status;
SELECT '🔑 Credenciais: admin@lunexa.com / admin123 as credentials; 