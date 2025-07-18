-- Dados iniciais para o sistema Lunexa - MySQL

-- Inserir tópicos de estudo padrão
INSERT INTO study_topics (user_id, title, subject, level, description) VALUES
(NULL, 'Álgebra Básica', 'Matemática', 'fundamental', 'Operações básicas com variáveis e equações lineares'),
(NULL, 'Geometria Plana', 'Matemática', 'fundamental', 'Figuras geométricas, perímetros e áreas'),
(NULL, 'Trigonometria', 'Matemática', 'medio', 'Funções trigonométricas e suas aplicações'),
(NULL, 'Cálculo Diferencial', 'Matemática', 'universitario', 'Limites, derivadas e suas aplicações'),

(NULL, 'História de Angola (Período Colonial)', 'História', 'medio', 'O período colonial angolano e suas características'),
(NULL, 'Revolução Industrial', 'História', 'medio', 'Transformações sociais e econômicas dos séculos XVIII-XIX'),
(NULL, 'Segunda Guerra Mundial', 'História', 'medio', 'Causas, desenvolvimento e consequências da guerra'),
(NULL, 'História Contemporânea', 'História', 'universitario', 'Século XX e XXI: globalização e transformações'),

(NULL, 'Mecânica Clássica', 'Física', 'medio', 'Leis de Newton e aplicações'),
(NULL, 'Termodinâmica', 'Física', 'universitario', 'Leis da termodinâmica e máquinas térmicas'),
(NULL, 'Eletromagnetismo', 'Física', 'universitario', 'Campos elétricos e magnéticos'),
(NULL, 'Física Quântica', 'Física', 'avancado', 'Princípios da mecânica quântica'),

(NULL, 'Química Orgânica', 'Química', 'medio', 'Compostos de carbono e suas reações'),
(NULL, 'Química Inorgânica', 'Química', 'medio', 'Elementos químicos e compostos inorgânicos'),
(NULL, 'Físico-Química', 'Química', 'universitario', 'Termodinâmica química e cinética'),

(NULL, 'Inglês Básico', 'Inglês', 'fundamental', 'Vocabulário e gramática básica'),
(NULL, 'Inglês Intermediário', 'Inglês', 'medio', 'Conversação e gramática avançada'),
(NULL, 'Inglês Avançado', 'Inglês', 'universitario', 'Fluência e expressões idiomáticas'),

(NULL, 'Biologia Celular', 'Biologia', 'medio', 'Estrutura e função das células'),
(NULL, 'Genética', 'Biologia', 'universitario', 'Hereditariedade e engenharia genética'),
(NULL, 'Ecologia', 'Biologia', 'medio', 'Relações entre organismos e ambiente');

-- Inserir avaliações padrão
INSERT INTO assessments (user_id, title, subject, questions, total_questions, difficulty) VALUES
(NULL, 'Matemática Básica', 'Matemática', JSON_ARRAY(
  JSON_OBJECT(
    'id', 1,
    'question', 'Qual é o resultado de 2x + 3 = 11?',
    'options', JSON_ARRAY('x = 3', 'x = 4', 'x = 5', 'x = 6'),
    'correct', 'x = 4',
    'explanation', '2x = 11 - 3 = 8, então x = 4'
  ),
  JSON_OBJECT(
    'id', 2,
    'question', 'Qual é a área de um quadrado com lado 5cm?',
    'options', JSON_ARRAY('20 cm²', '25 cm²', '30 cm²', '35 cm²'),
    'correct', '25 cm²',
    'explanation', 'Área = lado², então 5² = 25 cm²'
  ),
  JSON_OBJECT(
    'id', 3,
    'question', 'Qual é o valor de √16?',
    'options', JSON_ARRAY('2', '4', '6', '8'),
    'correct', '4',
    'explanation', '√16 = 4, pois 4² = 16'
  )
), 3, 'easy'),

(NULL, 'História de Angola', 'História', JSON_ARRAY(
  JSON_OBJECT(
    'id', 1,
    'question', 'Em que ano Angola se tornou independente de Portugal?',
    'options', JSON_ARRAY('1974', '1975', '1961', '1980'),
    'correct', '1975',
    'explanation', 'Angola tornou-se independente em 11 de Novembro de 1975.'
  ),
  JSON_OBJECT(
    'id', 2,
    'question', 'Quem foi o primeiro presidente de Angola?',
    'options', JSON_ARRAY('Jonas Savimbi', 'Holden Roberto', 'José Eduardo dos Santos', 'Agostinho Neto'),
    'correct', 'Agostinho Neto',
    'explanation', 'António Agostinho Neto foi o primeiro presidente de Angola após a independência.'
  ),
  JSON_OBJECT(
    'id', 3,
    'question', 'Qual o nome do deserto localizado no sul de Angola?',
    'options', JSON_ARRAY('Deserto do Saara', 'Deserto do Namibe', 'Deserto do Kalahari', 'Deserto da Líbia'),
    'correct', 'Deserto do Namibe',
    'explanation', 'O Deserto do Namibe estende-se pelo sul de Angola.'
  )
), 3, 'medium'),

(NULL, 'Física Básica', 'Física', JSON_ARRAY(
  JSON_OBJECT(
    'id', 1,
    'question', 'Qual é a unidade de força no Sistema Internacional?',
    'options', JSON_ARRAY('Joule', 'Newton', 'Watt', 'Pascal'),
    'correct', 'Newton',
    'explanation', 'Newton (N) é a unidade de força no SI'
  ),
  JSON_OBJECT(
    'id', 2,
    'question', 'Qual é a velocidade da luz no vácuo?',
    'options', JSON_ARRAY('300.000 km/s', '150.000 km/s', '450.000 km/s', '600.000 km/s'),
    'correct', '300.000 km/s',
    'explanation', 'A velocidade da luz no vácuo é aproximadamente 300.000 km/s'
  ),
  JSON_OBJECT(
    'id', 3,
    'question', 'Qual lei da física afirma que todo corpo em repouso tende a permanecer em repouso?',
    'options', JSON_ARRAY('Lei da Gravitação', 'Primeira Lei de Newton', 'Segunda Lei de Newton', 'Terceira Lei de Newton'),
    'correct', 'Primeira Lei de Newton',
    'explanation', 'A Primeira Lei de Newton é também conhecida como Lei da Inércia'
  )
), 3, 'medium');
