import mysql from "mysql2/promise"
import dotenv from 'dotenv';
dotenv.config();

console.log("DATABASE_URL carregado:", process.env.DATABASE_URL)

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

// Criar pool de conexões MySQL
export const db = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
})

// Função helper para executar queries
export async function query(sql: string, params: any[] = []) {
  try {
    const [results] = await db.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Tipos TypeScript para o banco de dados
export interface User {
  id: number
  name: string
  email: string
  password_hash: string
  avatar_url?: string
  bio?: string
  phone?: string
  role: 'user' | 'admin'
  study_goal: number
  difficulty_level: string
  preferred_subjects: string[]
  course_id?: number
  class_year?: string
  profile_photo_url?: string
  email_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface StudyTopic {
  id: number
  user_id?: number
  title: string
  subject: string
  level: string
  description?: string
  content?: string
  video_urls: string[]
  progress: number
  total_time_minutes: number
  completed: boolean
  created_at: Date
  updated_at: Date
}

export interface StudySession {
  id: number
  user_id: number
  topic_id: number
  duration_minutes: number
  date: Date
  notes?: string
  progress_before: number
  progress_after: number
  created_at: Date
}

export interface Assessment {
  id: number
  user_id?: number
  title: string
  subject: string
  questions: AssessmentQuestion[]
  total_questions: number
  difficulty: string
  created_at: Date
}

export interface AssessmentQuestion {
  id: number
  question: string
  options: string[]
  correct: string
  explanation: string
}

export interface AssessmentResult {
  id: number
  user_id: number
  assessment_id: number
  answers: Record<number, string>
  score: number
  total_questions: number
  correct_answers: number
  time_taken_minutes?: number
  completed_at: Date
}

export interface ChatMessage {
  id: number
  user_id: number
  message: string
  response?: string
  ai_provider: string
  context?: any
  created_at: Date
}

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: string
  read_at?: Date
  metadata?: any
  created_at: Date
}

export interface UserSettings {
  id: number
  user_id: number
  notifications_enabled: boolean
  study_reminders: boolean
  assessment_alerts: boolean
  achievement_notifications: boolean
  weekly_reports: boolean
  email_notifications: boolean
  theme: string
  font_size: string
  compact_mode: boolean
  animations: boolean
  created_at: Date
  updated_at: Date
}
