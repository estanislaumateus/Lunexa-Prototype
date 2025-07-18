-- Corrigir tabela study_topics para onboarding funcionar corretamente
USE lunexa_dbb;

-- Adicionar coluna discipline_id se não existir
ALTER TABLE study_topics ADD COLUMN discipline_id INT NULL AFTER user_id;

-- Adicionar foreign key (opcional, mas recomendado)
ALTER TABLE study_topics ADD CONSTRAINT fk_study_topics_discipline FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE SET NULL;

-- Verificar resultado
DESCRIBE study_topics; 