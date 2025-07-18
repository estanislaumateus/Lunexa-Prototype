"use server"

import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/database"
import { generateAssessmentQuestions } from "@/lib/ai"
import type { Assessment, AssessmentResult, AssessmentQuestion } from "@/lib/database"

export async function getAssessments() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Buscar avaliações disponíveis (padrão + do usuário)
  const assessments = await query(
    `
    SELECT 
      a.*,
      ar.score,
      ar.completed_at,
      CASE WHEN ar.id IS NOT NULL THEN true ELSE false END as completed
    FROM assessments a
    LEFT JOIN assessment_results ar ON a.id = ar.assessment_id AND ar.user_id = ?
    WHERE a.user_id IS NULL OR a.user_id = ?
    ORDER BY a.created_at DESC
  `,
    [user.id, user.id],
  )

  return assessments
}

export async function getAssessment(assessmentId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const assessments = await query(
    `
    SELECT * FROM assessments 
    WHERE id = ? AND (user_id IS NULL OR user_id = ?)
  `,
    [assessmentId, user.id],
  )

  let assessment = (assessments as Assessment[])[0]

  if (!assessment) {
    throw new Error("Avaliação não encontrada")
  }

  // Garantir que questions seja sempre um array de objetos
  if (assessment && typeof assessment.questions === "string") {
    try {
      assessment.questions = JSON.parse(assessment.questions)
    } catch (e) {
      assessment.questions = []
    }
  }

  return assessment
}

export async function submitAssessment(
  assessmentId: number,
  answers: Record<number, string>,
  timeTakenMinutes?: number,
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Buscar a avaliação
  const assessment = await getAssessment(assessmentId)
  const questions = assessment.questions as AssessmentQuestion[]

  // Calcular pontuação
  let correctAnswers = 0
  questions.forEach((question) => {
    if (answers[question.id] === question.correct) {
      correctAnswers++
    }
  })

  const score = (correctAnswers / questions.length) * 10

  // Salvar resultado
  const result = await query(
    `
    INSERT INTO assessment_results (
      user_id, assessment_id, answers, score, total_questions, 
      correct_answers, time_taken_minutes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [user.id, assessmentId, JSON.stringify(answers), score, questions.length, correctAnswers, timeTakenMinutes || null],
  )

  const insertId = (result as any).insertId
  const results = await query("SELECT * FROM assessment_results WHERE id = ?", [insertId])
  const assessmentResult = (results as AssessmentResult[])[0]

  // Criar notificação de resultado
  await query(
    `
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (?, ?, ?, ?, ?)
  `,
    [
      user.id,
      "Avaliação Concluída!",
      `Você obteve nota ${score.toFixed(1)} na avaliação "${assessment.title}"`,
      "achievement",
      JSON.stringify({ assessmentId, score, correctAnswers, totalQuestions: questions.length }),
    ],
  )

  return {
    success: true,
    result: assessmentResult,
    score,
    correctAnswers,
    totalQuestions: questions.length,
    questions,
  }
}

export async function createCustomAssessment(
  title: string,
  subject: string,
  topic: string,
  difficulty: string,
  questionCount = 5,
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  try {
    // Gerar questões com IA
    const aiQuestions = await generateAssessmentQuestions(subject, topic, difficulty, questionCount)

    // Criar avaliação
    const result = await query(
      `
      INSERT INTO assessments (user_id, title, subject, questions, total_questions, difficulty)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [user.id, title, subject, JSON.stringify(aiQuestions.questions), questionCount, difficulty],
    )

    const insertId = (result as any).insertId
    const assessments = await query("SELECT * FROM assessments WHERE id = ?", [insertId])

    return {
      success: true,
      assessment: (assessments as Assessment[])[0],
      aiProvider: aiQuestions.provider,
    }
  } catch (error) {
    console.error("Erro ao criar avaliação:", error)
    return { error: "Erro ao gerar questões. Tente novamente." }
  }
}

export async function getAssessmentResults() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const results = await query(
    `
    SELECT 
      ar.*,
      a.title,
      a.subject
    FROM assessment_results ar
    JOIN assessments a ON ar.assessment_id = a.id
    WHERE ar.user_id = ?
    ORDER BY ar.completed_at DESC
  `,
    [user.id],
  )

  return results
}

export async function getAssessmentStats() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const stats = await query(
    `
    SELECT 
      COUNT(*) as total_assessments,
      AVG(score) as average_score,
      MAX(score) as best_score,
      SUM(correct_answers) as total_correct,
      SUM(total_questions) as total_questions
    FROM assessment_results
    WHERE user_id = ?
  `,
    [user.id],
  )

  const subjectStats = await query(
    `
    SELECT 
      a.subject,
      COUNT(ar.id) as assessment_count,
      AVG(ar.score) as average_score,
      MAX(ar.score) as best_score
    FROM assessment_results ar
    JOIN assessments a ON ar.assessment_id = a.id
    WHERE ar.user_id = ?
    GROUP BY a.subject
  `,
    [user.id],
  )

  return {
    general: (stats as any[])[0],
    subjects: subjectStats,
  }
}
