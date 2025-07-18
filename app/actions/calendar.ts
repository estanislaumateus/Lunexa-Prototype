"use server"

import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/database"

interface StudyScheduleData {
  title: string
  subject: string
  topic_id?: number
  date: string
  start_time: string
  end_time: string
  description?: string
}

export async function getStudySchedule() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const schedule = await query(
    `
    SELECT 
      ss.*,
      st.title as topic_title,
      st.subject as topic_subject
    FROM study_schedule ss
    LEFT JOIN study_topics st ON ss.topic_id = st.id
    WHERE ss.user_id = ?
    ORDER BY ss.date ASC, ss.start_time ASC
  `,
    [user.id],
  )

  return schedule
}

export async function createStudySchedule(data: StudyScheduleData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  try {
    // Verificar se não há conflito de horário
    const conflicts = await query(
      `
      SELECT id FROM study_schedule
      WHERE user_id = ? AND date = ? 
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `,
      [
        user.id,
        data.date,
        data.start_time,
        data.start_time,
        data.end_time,
        data.end_time,
        data.start_time,
        data.end_time,
      ],
    )

    if ((conflicts as any[]).length > 0) {
      return { error: "Já existe um agendamento neste horário" }
    }

    const result = await query(
      `
      INSERT INTO study_schedule (
        user_id, title, subject, topic_id, date, start_time, end_time, description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        user.id,
        data.title,
        data.subject,
        data.topic_id || null,
        data.date,
        data.start_time,
        data.end_time,
        data.description || null,
      ],
    )

    // Criar notificação de lembrete
    await query(
      `
      INSERT INTO notifications (user_id, title, message, type, metadata)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        user.id,
        "Estudo Agendado",
        `Você tem "${data.title}" agendado para ${new Date(data.date).toLocaleDateString()} às ${data.start_time}`,
        "schedule",
        JSON.stringify({ scheduleId: (result as any).insertId, topicId: data.topic_id }),
      ],
    )

    return { success: true }
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function updateStudySchedule(scheduleId: number, data: Partial<StudyScheduleData>) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const updateFields: string[] = []
  const values = []

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = ?`)
      values.push(value)
    }
  })

  if (updateFields.length === 0) {
    return { success: true }
  }

  values.push(scheduleId, user.id)

  await query(
    `
    UPDATE study_schedule 
    SET ${updateFields.join(", ")}, updated_at = NOW()
    WHERE id = ? AND user_id = ?
  `,
    values,
  )

  return { success: true }
}

export async function deleteStudySchedule(scheduleId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  await query("DELETE FROM study_schedule WHERE id = ? AND user_id = ?", [scheduleId, user.id])

  return { success: true }
}

export async function markScheduleAsCompleted(scheduleId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  await query(
    `
    UPDATE study_schedule 
    SET completed = true, updated_at = NOW()
    WHERE id = ? AND user_id = ?
  `,
    [scheduleId, user.id],
  )

  return { success: true }
}
