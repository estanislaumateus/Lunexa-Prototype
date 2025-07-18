import { generateText } from "ai"
import { cohere } from "@ai-sdk/cohere"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"

// Configuração dos provedores de IA
const AI_PROVIDERS = {
  cohere: cohere("command-r-plus"),
  anthropic: anthropic("claude-3-haiku-20240307"),
  google: google("gemini-1.5-flash"),
}

export type AIProvider = keyof typeof AI_PROVIDERS

function isTLP(subject: string): boolean {
  const normalized = subject.trim().toLowerCase().replace(/[^a-z]/g, "");
  return (
    normalized === "tlp" ||
    normalized === "tlp" ||
    normalized === "tecnicasdelinguagensdeprogramacao" ||
    normalized === "tecnicasdelinguagemdeprogramacao" ||
    normalized === "tecnicaslinguagensprogramacao" ||
    normalized.includes("tlp") ||
    normalized.includes("tecnicas") && normalized.includes("programacao")
  );
}

// Função para gerar conteúdo educacional
export async function generateEducationalContent(
  topic: string,
  subject: string,
  level: string,
  provider: AIProvider = "cohere",
) {
  try {
    // Adaptação especial para TLP (robusta)
    let systemPrompt = `Você é um professor especialista em ${subject}. Crie conteúdo educacional claro, didático e adequado para o nível ${level}.`;
    let userPrompt = `Crie um conteúdo educacional completo sobre "${topic}" para estudantes de nível ${level}. \n\nO conteúdo deve incluir:\n\n## 1. Introdução\nExplique o conceito de forma simples e clara.\n\n## 2. Conceitos Fundamentais\nDetalhe os principais conceitos com exemplos práticos.\n\n## 3. Explicação Detalhada\nDesenvolva o tema com profundidade adequada ao nível.\n\n## 4. Exemplos Práticos\nForneça pelo menos 3 exemplos concretos e aplicáveis.\n\n## 5. Aplicações no Mundo Real\nMostre onde este conhecimento é usado na prática.\n\n## 6. Exercícios para Fixação\nCrie 5 exercícios progressivos para praticar.\n\n## 7. Dicas de Estudo\nForneça estratégias específicas para dominar este tópico.\n\n## 8. Recursos Complementares\nSugira livros, sites ou materiais adicionais.\n\nMantenha uma linguagem adequada ao nível educacional e seja didático. Use formatação em Markdown.`;

    if (isTLP(subject)) {
      systemPrompt = `Você é um professor especialista em Técnicas de Linguagens de Programação (TLP), área de programação de computadores. Crie conteúdo educacional claro, didático e adequado para o nível ${level}. O conteúdo deve ser sobre programação, algoritmos, lógica computacional, linguagens de programação e nunca sobre literatura portuguesa. Nunca mencione literatura portuguesa, autores literários, poesia ou temas de literatura.`;
      userPrompt = `Crie um conteúdo educacional completo sobre "${topic}" para estudantes de nível ${level} na disciplina de Técnicas de Linguagens de Programação (TLP).\n\nO conteúdo deve ser sobre programação, algoritmos, lógica computacional, linguagens de programação e nunca sobre literatura portuguesa. Nunca mencione literatura portuguesa, autores literários, poesia ou temas de literatura.\n\nInclua:\n\n## 1. Introdução\nExplique o conceito de forma simples e clara.\n\n## 2. Conceitos Fundamentais\nDetalhe os principais conceitos com exemplos práticos de programação.\n\n## 3. Explicação Detalhada\nDesenvolva o tema com profundidade adequada ao nível, sempre focando em programação.\n\n## 4. Exemplos Práticos\nForneça pelo menos 3 exemplos de código ou situações reais de programação.\n\n## 5. Aplicações no Mundo Real\nMostre onde este conhecimento é usado na prática de programação.\n\n## 6. Exercícios para Fixação\nCrie 5 exercícios progressivos para praticar programação.\n\n## 7. Dicas de Estudo\nForneça estratégias específicas para dominar este tópico em programação.\n\n## 8. Recursos Complementares\nSugira livros, sites ou materiais adicionais de programação.\n\nMantenha uma linguagem adequada ao nível educacional, seja didático e nunca relacione o conteúdo à literatura portuguesa. Use formatação em Markdown.`;
    }

    const { text } = await generateText({
      model: AI_PROVIDERS[provider],
      system: systemPrompt,
      prompt: userPrompt,
    })

    return {
      content: text,
      provider,
      success: true,
    }
  } catch (error) {
    console.error(`Erro ao gerar conteúdo com ${provider}:`, error)

    // Tentar com outro provedor
    const fallbackProviders: AIProvider[] = ["cohere", "google", "anthropic"]
    const nextProvider = fallbackProviders.find((p) => p !== provider)

    if (nextProvider) {
      return generateEducationalContent(topic, subject, level, nextProvider)
    }

    // Se todos falharam, retornar conteúdo padrão
    return {
      content: generateDefaultContent(topic, subject, level),
      provider: "fallback",
      success: false,
    }
  }
}

// Função para chat com IA
export async function chatWithAI(message: string, context = "", provider: AIProvider = "cohere") {
  try {
    const { text } = await generateText({
      model: AI_PROVIDERS[provider],
      system: `Você é um assistente educacional inteligente e experiente. Sua missão é ajudar estudantes com suas dúvidas de forma clara, didática e encorajadora.

DIRETRIZES:
- Seja sempre paciente e encorajador
- Explique conceitos de forma simples antes de avançar
- Use exemplos práticos e analogias quando apropriado
- Faça perguntas para verificar o entendimento
- Sugira recursos adicionais quando relevante
- Mantenha um tom amigável e motivador

Contexto da conversa anterior: ${context}`,
      prompt: `Pergunta do estudante: ${message}

Por favor, responda de forma educativa e útil, adaptando sua explicação ao nível de conhecimento demonstrado na pergunta.`,
    })

    return {
      response: text,
      provider,
      success: true,
    }
  } catch (error) {
    console.error(`Erro no chat com ${provider}:`, error)

    // Tentar com outro provedor
    const fallbackProviders: AIProvider[] = ["cohere", "google", "anthropic"]
    const nextProvider = fallbackProviders.find((p) => p !== provider)

    if (nextProvider) {
      return chatWithAI(message, context, nextProvider)
    }

    // Resposta padrão se todos falharam
    return {
      response:
        "Desculpe, estou com dificuldades técnicas no momento. Tente reformular sua pergunta ou tente novamente em alguns minutos. Enquanto isso, posso sugerir que você consulte materiais de estudo relacionados ao seu tópico de interesse.",
      provider: "fallback",
      success: false,
    }
  }
}

// Função para gerar questões de avaliação
export async function generateAssessmentQuestions(
  subject: string,
  topic: string,
  difficulty: string,
  count = 5,
  provider: AIProvider = "cohere",
) {
  try {
    const { text } = await generateText({
      model: AI_PROVIDERS[provider],
      system: `Você é um especialista em criar avaliações educacionais. Crie questões de múltipla escolha bem estruturadas e pedagogicamente válidas.`,
      prompt: `Crie ${count} questões de múltipla escolha sobre "${topic}" na matéria ${subject}, nível de dificuldade ${difficulty}.

REQUISITOS:
- Questões claras e objetivas
- 4 alternativas por questão (A, B, C, D)
- Apenas uma resposta correta
- Explicação detalhada para cada resposta
- Progressão de dificuldade nas questões
- Evite pegadinhas desnecessárias

Retorne APENAS o JSON válido no formato:
{
  "questions": [
    {
      "id": 1,
      "question": "Pergunta clara e objetiva aqui",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correct": "Opção correta exata",
      "explanation": "Explicação detalhada da resposta correta e por que as outras estão incorretas"
    }
  ]
}`,
    })

    try {
      const parsed = JSON.parse(text)
      return {
        questions: parsed.questions,
        provider,
        success: true,
      }
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError)
      throw new Error("Resposta da IA não está em formato JSON válido")
    }
  } catch (error) {
    console.error(`Erro ao gerar questões com ${provider}:`, error)

    // Tentar com outro provedor
    const fallbackProviders: AIProvider[] = ["cohere", "google", "anthropic"]
    const nextProvider = fallbackProviders.find((p) => p !== provider)

    if (nextProvider) {
      return generateAssessmentQuestions(subject, topic, difficulty, count, nextProvider)
    }

    // Questões padrão se todos falharam
    return {
      questions: generateDefaultQuestions(subject, topic, count),
      provider: "fallback",
      success: false,
    }
  }
}

// Função para sugerir tópicos de estudo
export async function suggestStudyTopics(
  userLevel: string,
  preferredSubjects: string[],
  studyHistory: string[],
  provider: AIProvider = "cohere",
) {
  try {
    const { text } = await generateText({
      model: AI_PROVIDERS[provider],
      system: `Você é um conselheiro educacional especializado em personalizar planos de estudo baseados no perfil individual de cada estudante.`,
      prompt: `Com base no perfil do estudante, sugira 5 tópicos de estudo personalizados e relevantes:

PERFIL DO ESTUDANTE:
- Nível: ${userLevel}
- Matérias de interesse: ${preferredSubjects.join(", ")}
- Histórico recente: ${studyHistory.length > 0 ? studyHistory.join(", ") : "Nenhum histórico ainda"}

CRITÉRIOS PARA SUGESTÕES:
- Adequadas ao nível do estudante
- Relacionadas às matérias de interesse
- Progressão lógica baseada no histórico
- Relevância prática e aplicabilidade
- Variedade para manter o engajamento

Retorne APENAS o JSON válido no formato:
{
  "suggestions": [
    {
      "title": "Título claro e atrativo do tópico",
      "subject": "Matéria específica",
      "level": "Nível de dificuldade",
      "description": "Descrição concisa do que será aprendido",
      "estimatedTime": "Tempo estimado de estudo",
      "reason": "Por que este tópico é recomendado para este estudante específico"
    }
  ]
}`,
    })

    try {
      const parsed = JSON.parse(text)
      return {
        suggestions: parsed.suggestions,
        provider,
        success: true,
      }
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError)
      throw new Error("Resposta da IA não está em formato JSON válido")
    }
  } catch (error) {
    console.error(`Erro ao sugerir tópicos com ${provider}:`, error)

    // Tentar com outro provedor
    const fallbackProviders: AIProvider[] = ["cohere", "google", "anthropic"]
    const nextProvider = fallbackProviders.find((p) => p !== provider)

    if (nextProvider) {
      return suggestStudyTopics(userLevel, preferredSubjects, studyHistory, nextProvider)
    }

    // Sugestões padrão se todos falharam
    return {
      suggestions: generateDefaultSuggestions(preferredSubjects, userLevel),
      provider: "fallback",
      success: false,
    }
  }
}

// Função para gerar vídeos educacionais (simulado)
export async function generateEducationalVideos(topic: string, subject: string) {
  // Simulação de vídeos educacionais baseados no tópico
  const videos = [
    {
      title: `Introdução a ${topic}`,
      duration: "15:30",
      description: `Conceitos básicos e fundamentais sobre ${topic}`,
      thumbnail: `/placeholder.svg?height=180&width=320&text=${encodeURIComponent(topic + " - Intro")}`,
      url: `#video-intro-${topic.toLowerCase().replace(/\s+/g, "-")}`,
    },
    {
      title: `${topic} na Prática`,
      duration: "22:45",
      description: `Exemplos práticos e aplicações reais de ${topic}`,
      thumbnail: `/placeholder.svg?height=180&width=320&text=${encodeURIComponent(topic + " - Prática")}`,
      url: `#video-pratica-${topic.toLowerCase().replace(/\s+/g, "-")}`,
    },
    {
      title: `Exercícios de ${topic}`,
      duration: "18:20",
      description: `Resolução passo a passo de exercícios sobre ${topic}`,
      thumbnail: `/placeholder.svg?height=180&width=320&text=${encodeURIComponent(topic + " - Exercícios")}`,
      url: `#video-exercicios-${topic.toLowerCase().replace(/\s+/g, "-")}`,
    },
  ]

  return videos
}

// Funções auxiliares para conteúdo padrão
function generateDefaultContent(topic: string, subject: string, level: string): string {
  if (isTLP(subject)) {
    return `# ${topic}
\n## Introdução
Este é um tópico importante em Técnicas de Linguagens de Programação (TLP) para estudantes de nível ${level}.
O conteúdo a seguir é focado em programação, algoritmos, lógica computacional e linguagens de programação, nunca sobre literatura portuguesa, autores literários, poesia ou temas de literatura.\n\n## Conceitos Fundamentais\n- Conceito fundamental de programação 1\n- Conceito fundamental de programação 2\n- Conceito fundamental de programação 3\n\n## Explicação Detalhada\n${topic} é um tema essencial em programação e lógica computacional. Aqui você aprenderá conceitos práticos e teóricos aplicados ao desenvolvimento de software.\n\n## Exemplos Práticos\n1. Exemplo de código ou algoritmo relacionado ao tema\n2. Aplicação prática em uma linguagem de programação\n3. Exercício de lógica computacional\n\n## Exercícios para Fixação\n1. Escreva um algoritmo simples sobre o tema\n2. Resolva um problema de lógica usando programação\n3. Implemente um exemplo em uma linguagem de sua escolha\n4. Explique a diferença entre dois conceitos de programação relacionados\n5. Descreva uma aplicação real do tema em software\n\n## Dicas de Estudo\n- Pratique escrevendo código\n- Resolva desafios de lógica\n- Estude exemplos de algoritmos\n- Participe de grupos de programação\n\n## Recursos Complementares\n- Livros de algoritmos e programação\n- Sites como HackerRank, Codeforces, URI Online Judge\n- Vídeos e cursos de lógica de programação\n- Documentação de linguagens de programação`;
  }

  return `# ${topic}
\n## Introdução\nEste é um tópico importante em ${subject} para estudantes de nível ${level}.\n\n## Conceitos Fundamentais\n- Conceito básico 1\n- Conceito básico 2\n- Conceito básico 3\n\n## Explicação Detalhada\n${topic} é um tema fundamental que requer compreensão gradual e prática constante.\n\n## Exemplos Práticos\n1. Exemplo prático relacionado ao cotidiano\n2. Aplicação em situações reais\n3. Exercício básico para fixação\n\n## Exercícios para Fixação\n1. Questão básica sobre o conceito\n2. Aplicação prática do conhecimento\n3. Problema mais elaborado\n4. Exercício de síntese\n5. Desafio avançado\n\n## Dicas de Estudo\n- Pratique regularmente\n- Faça anotações\n- Busque exemplos adicionais\n- Discuta com colegas\n\n## Recursos Complementares\n- Livros didáticos da área\n- Vídeos educacionais online\n- Exercícios práticos\n- Grupos de estudo`;
}

function generateDefaultQuestions(subject: string, topic: string, count: number) {
  const questions = []
  for (let i = 1; i <= count; i++) {
    questions.push({
      id: i,
      question: `Questão ${i} sobre ${topic} em ${subject}`,
      options: ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      correct: "Alternativa A",
      explanation: `Esta é a explicação para a questão ${i} sobre ${topic}.`,
    })
  }
  return questions
}

function generateDefaultSuggestions(subjects: string[], level: string) {
  return subjects.slice(0, 5).map((subject, index) => ({
    title: `Fundamentos de ${subject}`,
    subject: subject,
    level: level,
    description: `Conceitos básicos e essenciais de ${subject}`,
    estimatedTime: "2-3 horas",
    reason: `Recomendado para fortalecer a base em ${subject}`,
  }))
}
