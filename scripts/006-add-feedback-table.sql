-- Script para adicionar tabela de feedback
USE lunexa_dbb;

-- Tabela de feedback dos usuários
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- interface, content, performance, features, mobile, other
    priority VARCHAR(20) NOT NULL, -- low, medium, high, critical
    contact_email VARCHAR(255),
    feedback_type VARCHAR(20) NOT NULL, -- bug, feature, general
    rating INT NOT NULL, -- 1-5 estrelas
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, in_progress, resolved, rejected
    admin_notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_priority ON feedback(priority);
CREATE INDEX idx_feedback_category ON feedback(category);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC); 