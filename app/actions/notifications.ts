"use server"

import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/database"
import type { Notification } from "@/lib/database"
import type { UserSettings } from "@/lib/database"

export async function getNotifications(): Promise<Notification[]> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const notifications = await query(
    `
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `,
    [user.id],
  )

  return notifications as Notification[]
}

export async function markNotificationAsRead(notificationId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  await query(
    `
    UPDATE notifications 
    SET read_at = NOW()
    WHERE id = ? AND user_id = ?
  `,
    [notificationId, user.id],
  )

  return { success: true }
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const result = await query(
    `SELECT * FROM user_settings WHERE user_id = ? LIMIT 1`,
    [user.id],
  ) as UserSettings[] // 👈 Aqui está a correção principal

  return result[0] || null
}

export async function updateUserSettings(settings: any) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Exemplo simples de atualização — depende da estrutura real da tabela
  await query(
    `UPDATE user_settings SET email_notifications = ? WHERE user_id = ?`,
    [settings.email_notifications, user.id],
  )

  return { success: true }
}


export async function markAllNotificationsAsRead() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  await query(
    `
    UPDATE notifications 
    SET read_at = NOW()
    WHERE user_id = ? AND read_at IS NULL
  `,
    [user.id],
  )

  return { success: true }
}

export async function createNotification(title: string, message: string, type: string, metadata?: any) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const result = await query(
    `
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (?, ?, ?, ?, ?)
  `,
    [user.id, title, message, type, JSON.stringify(metadata || {})],
  )

  const insertId = (result as any).insertId
  const notifications = await query("SELECT * FROM notifications WHERE id = ?", [insertId])

  return (notifications as Notification[])[0]
}

export async function getUnreadNotificationCount() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    return 0
  }

  const result = await query(
    `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = ? AND read_at IS NULL
  `,
    [user.id],
  )

  return (result as any[])[0]?.count || 0
}

// Função para criar notificações automáticas
export async function createStudyReminder() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    return
  }

  // Verificar se o usuário estudou hoje
  const todayStudy = await query(
    `
    SELECT COUNT(*) as count
    FROM study_sessions
    WHERE user_id = ? AND date = CURDATE()
  `,
    [user.id],
  )

  if ((todayStudy as any[])[0]?.count === 0) {
    await createNotification(
      "Lembrete de Estudo",
      "Que tal dedicar um tempo aos estudos hoje? Você ainda não registrou nenhuma sessão.",
      "reminder",
    )
  }
}
