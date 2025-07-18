-- Script para adicionar sistema de cursos e disciplinas
-- Execute este script após os scripts anteriores

USE lunexa_dbb;

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) NOT NULL, -- fundamental, medio, universitario, avancado
    duration_months INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20),
    credits INT DEFAULT 0,
    semester INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabela de tópicos de estudo (atualizada para incluir disciplina)
CREATE TABLE IF NOT EXISTS study_topics_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    discipline_id INT,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL, -- fundamental, medio, universitario, avancado
    description TEXT,
    content LONGTEXT, -- Conteúdo gerado por IA
    video_urls JSON, -- URLs de vídeos relacionados
    progress DECIMAL(5,2) DEFAULT 0,
    total_time_minutes INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    estimated_reading_time_minutes INT DEFAULT 1, -- Tempo estimado de leitura
    minimum_score DECIMAL(4,2) DEFAULT 7.0, -- Nota mínima para aprovação
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE SET NULL
);

-- Tabela de matrículas de usuários em cursos
CREATE TABLE IF NOT EXISTS user_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    completion_date DATE NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, dropped
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course (user_id, course_id)
);

-- Tabela de progresso de estudo por disciplina
CREATE TABLE IF NOT EXISTS user_discipline_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    discipline_id INT NOT NULL,
    overall_progress DECIMAL(5,2) DEFAULT 0,
    total_time_minutes INT DEFAULT 0,
    topics_completed INT DEFAULT 0,
    total_topics INT DEFAULT 0,
    last_study_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_discipline (user_id, discipline_id)
);

-- Tabela de sessões de estudo (atualizada)
CREATE TABLE IF NOT EXISTS study_sessions_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    discipline_id INT,
    duration_minutes INT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    progress_before DECIMAL(5,2) DEFAULT 0,
    progress_after DECIMAL(5,2) DEFAULT 0,
    reading_time_minutes INT DEFAULT 0, -- Tempo real de leitura
    marked_as_known BOOLEAN DEFAULT FALSE, -- Se o usuário marcou como já conhecido
    assessment_score DECIMAL(4,2) NULL, -- Nota da avaliação se aplicável
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES study_topics_new(id) ON DELETE CASCADE,
    FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE SET NULL
);

-- Adicionar colunas à tabela de usuários
ALTER TABLE users 
ADD COLUMN course_id INT NULL,
ADD COLUMN class_year VARCHAR(20) NULL, -- Ano/turma do estudante
ADD COLUMN profile_photo_url VARCHAR(500) NULL,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verification_token VARCHAR(255) NULL,
ADD COLUMN email_verification_expires TIMESTAMP NULL,
ADD FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_disciplines_course_id ON disciplines(course_id);
CREATE INDEX idx_study_topics_discipline_id ON study_topics_new(discipline_id);
CREATE INDEX idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX idx_user_discipline_progress_user_id ON user_discipline_progress(user_id);
CREATE INDEX idx_user_discipline_progress_discipline_id ON user_discipline_progress(discipline_id);
CREATE INDEX idx_study_sessions_discipline_id ON study_sessions_new(discipline_id);
CREATE INDEX idx_users_course_id ON users(course_id);
CREATE INDEX idx_users_email_verified ON users(email_verified); 