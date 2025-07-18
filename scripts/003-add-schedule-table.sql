-- Adicionar tabela de agendamentos de estudo

CREATE TABLE IF NOT EXISTS study_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    topic_id INT, 
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES study_topics(id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX idx_study_schedule_user_date ON study_schedule(user_id, date);
CREATE INDEX idx_study_schedule_date_time ON study_schedule(date, start_time);
