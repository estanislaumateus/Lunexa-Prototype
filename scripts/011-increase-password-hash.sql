USE lunexa_dbb;
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NOT NULL;
-- Verificar resultado
DESCRIBE users; 