-- Script para inserir o curso de Informática, disciplinas e tópicos
USE lunexa_dbb;

-- Inserir curso de Informática
INSERT INTO courses (name, description, level, duration_months) VALUES
('Informática', 'Curso técnico de Informática com foco em fundamentos de TI, programação, hardware, redes e eletrônica.', 'medio', 36);

SET @course_id = LAST_INSERT_ID();

-- Disciplinas do curso de Informática
INSERT INTO disciplines (course_id, name, description) VALUES
(@course_id, 'Língua Portuguesa', 'Leitura, redação, gramática e comunicação profissional'),
(@course_id, 'Inglês Técnico', 'Vocabulário técnico, leitura e tradução de textos de TI'),
(@course_id, 'Matemática', 'Álgebra, funções, estatística, trigonometria e cálculo'),
(@course_id, 'FAI (Formação de Atitudes Integradoras)', 'Ética, cidadania, relações interpessoais e comunicação profissional'),
(@course_id, 'Física', 'Grandezas, leis de Newton, termodinâmica, ondas, eletricidade'),
(@course_id, 'Química', 'Estrutura da matéria, ligações, reações, soluções, química ambiental'),
(@course_id, 'Educação Física', 'Condição física, saúde mental, ergonomia e qualidade de vida'),
(@course_id, 'TIC', 'Hardware, software, sistemas operativos, internet, segurança, colaboração'),
(@course_id, 'SEAC', 'Arquitetura de computadores, lógica digital, redes, protocolos'),
(@course_id, 'Electrotecnia', 'Corrente, tensão, circuitos, transformadores, segurança elétrica'),
(@course_id, 'TREI', 'Manutenção, diagnóstico, montagem e testes de equipamentos informáticos'),
(@course_id, 'OGI', 'Gestão, organização, documentação, controle de qualidade e projetos'),
(@course_id, 'TLP', 'Lógica, algoritmos, programação estruturada e orientada a objetos, banco de dados, versionamento, front-end e back-end');

-- Tópicos para cada disciplina (exemplo para algumas disciplinas)
-- Língua Portuguesa
INSERT INTO study_topics (user_id, title, subject, level, description) VALUES
(NULL, 'Leitura e interpretação de textos técnicos', 'Língua Portuguesa', 'medio', 'Compreensão de textos técnicos e profissionais'),
(NULL, 'Gramática aplicada', 'Língua Portuguesa', 'medio', 'Morfossintaxe, ortografia, pontuação'),
(NULL, 'Redação de relatórios e e-mails formais', 'Língua Portuguesa', 'medio', 'Como escrever documentos técnicos e e-mails profissionais'),
(NULL, 'Produção de textos dissertativos e argumentativos', 'Língua Portuguesa', 'medio', 'Estruturação e argumentação de textos'),
(NULL, 'Comunicação escrita e oral no contexto profissional', 'Língua Portuguesa', 'medio', 'Técnicas de comunicação no ambiente de trabalho');

-- Inglês Técnico
INSERT INTO study_topics (user_id, title, subject, level, description) VALUES
(NULL, 'Vocabulário técnico em informática', 'Inglês Técnico', 'medio', 'Termos e expressões comuns em TI'),
(NULL, 'Leitura e interpretação de manuais e artigos', 'Inglês Técnico', 'medio', 'Compreensão de textos técnicos em inglês'),
(NULL, 'Instruções básicas e comandos em inglês técnico', 'Inglês Técnico', 'medio', 'Comandos e instruções em inglês para TI'),
(NULL, 'Tradução de textos técnicos', 'Inglês Técnico', 'medio', 'Tradução de textos de software, hardware e redes'),
(NULL, 'Diálogos em contexto profissional', 'Inglês Técnico', 'medio', 'Conversação em inglês no ambiente de trabalho');

-- Matemática
INSERT INTO study_topics (user_id, title, subject, level, description) VALUES
(NULL, 'Aritmética e operações com números reais', 'Matemática', 'medio', 'Operações básicas e propriedades dos números reais'),
(NULL, 'Álgebra', 'Matemática', 'medio', 'Equações, inequações e polinômios'),
(NULL, 'Funções', 'Matemática', 'medio', 'Funções afim, quadrática, exponencial e logarítmica'),
(NULL, 'Análise combinatória e probabilidade', 'Matemática', 'medio', 'Princípios de contagem e cálculo de probabilidades'),
(NULL, 'Estatística', 'Matemática', 'medio', 'Média, mediana, desvio padrão, gráficos'),
(NULL, 'Geometria', 'Matemática', 'medio', 'Geometria plana, espacial e analítica'),
(NULL, 'Trigonometria', 'Matemática', 'medio', 'Relações trigonométricas, funções e identidades'),
(NULL, 'Limites e derivadas', 'Matemática', 'medio', 'Introdução ao cálculo diferencial'),
(NULL, 'Matrizes e determinantes', 'Matemática', 'medio', 'Operações com matrizes e determinantes'),
(NULL, 'Progressões aritméticas e geométricas', 'Matemática', 'medio', 'PA, PG e aplicações'),
(NULL, 'Sistemas lineares', 'Matemática', 'medio', 'Resolução de sistemas lineares');

-- (Repita para as demais disciplinas conforme as imagens) 