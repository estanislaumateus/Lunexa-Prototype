"use server"

import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/database"
import { hashPassword, verifyPassword } from "@/lib/auth"
import type { UserSettings } from "@/lib/database"

export async function getCurrentUserProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    phone: user.phone,
    avatar_url: user.avatar_url,
    study_goal: user.study_goal,
    difficulty_level: user.difficulty_level,
    preferred_subjects: user.preferred_subjects || [],
  }
}

export async function getUserSettings() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const settings = await query("SELECT * FROM user_settings WHERE user_id = ?", [user.id])

  return (settings as UserSettings[])[0] || null
}

export async function updateUserProfile(data: {
  name?: string
  email?: string
  bio?: string
  phone?: string
  study_goal?: number
  difficulty_level?: string
  preferred_subjects?: string[]
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const updateFields = []
  const values = []

  if (data.name) {
    updateFields.push("name = ?")
    values.push(data.name)
  }

  if (data.email) {
    updateFields.push("email = ?")
    values.push(data.email)
  }

  if (data.bio !== undefined) {
    updateFields.push("bio = ?")
    values.push(data.bio)
  }

  if (data.phone !== undefined) {
    updateFields.push("phone = ?")
    values.push(data.phone)
  }

  if (data.study_goal) {
    updateFields.push("study_goal = ?")
    values.push(data.study_goal)
  }

  if (data.difficulty_level) {
    updateFields.push("difficulty_level = ?")
    values.push(data.difficulty_level)
  }

  if (data.preferred_subjects) {
    updateFields.push("preferred_subjects = ?")
    values.push(JSON.stringify(data.preferred_subjects))
  }

  if (updateFields.length === 0) {
    return { success: true }
  }

  updateFields.push("updated_at = NOW()")
  values.push(user.id)

  await query(
    `
    UPDATE users 
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `,
    values,
  )

  return { success: true }
}

export async function updateUserSettings(settings: Partial<UserSettings>) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Verificar se já existem configurações
  const existing = await query("SELECT id FROM user_settings WHERE user_id = ?", [user.id])

  if ((existing as any[]).length === 0) {
    // Criar configurações
    const fields = Object.keys(settings)
    const placeholders = fields.map(() => "?").join(", ")
    const values = Object.values(settings)

    await query(
      `
      INSERT INTO user_settings (user_id, ${fields.join(", ")})
      VALUES (?, ${placeholders})
    `,
      [user.id, ...values],
    )
  } else {
    // Atualizar configurações
    const updateFields = Object.keys(settings).map((key) => `${key} = ?`)
    updateFields.push("updated_at = NOW()")
    const values = Object.values(settings)

    await query(
      `
      UPDATE user_settings 
      SET ${updateFields.join(", ")}
      WHERE user_id = ?
    `,
      [...values, user.id],
    )
  }

  return { success: true }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Verificar senha atual
  const isValid = await verifyPassword(currentPassword, user.password_hash)
  if (!isValid) {
    return { error: "Senha atual incorreta" }
  }

  // Hash da nova senha
  const newPasswordHash = await hashPassword(newPassword)

  // Atualizar senha
  await query(
    `
    UPDATE users 
    SET password_hash = ?, updated_at = NOW()
    WHERE id = ?
  `,
    [newPasswordHash, user.id],
  )

  return { success: true }
}

export async function deleteUserAccount() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Deletar usuário (cascade irá deletar dados relacionados)
  await query("DELETE FROM users WHERE id = ?", [user.id])

  // Limpar cookie
  cookieStore.delete("auth-token")

  return { success: true }
}

export async function exportUserData() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Buscar todos os dados do usuário
  const userData = await query(
    `
    SELECT 
      u.name, u.email, u.bio, u.phone, u.study_goal, u.difficulty_level, u.preferred_subjects,
      u.created_at as user_created_at
    FROM users u
    WHERE u.id = ?
  `,
    [user.id],
  )

  const studyTopics = await query("SELECT * FROM study_topics WHERE user_id = ?", [user.id])
  const studySessions = await query("SELECT * FROM study_sessions WHERE user_id = ?", [user.id])
  const assessmentResults = await query("SELECT * FROM assessment_results WHERE user_id = ?", [user.id])
  const chatMessages = await query("SELECT * FROM chat_messages WHERE user_id = ?", [user.id])
  const notifications = await query("SELECT * FROM notifications WHERE user_id = ?", [user.id])
  const settings = await query("SELECT * FROM user_settings WHERE user_id = ?", [user.id])

  return {
    user: (userData as any[])[0],
    studyTopics,
    studySessions,
    assessmentResults,
    chatMessages,
    notifications,
    settings: (settings as any[])[0],
    exportedAt: new Date().toISOString(),
  }
}

// TODO: Replace this with a real cloud storage solution (e.g., Vercel Blob, S3, Cloudinary)
export async function uploadAvatar(file: File) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  // This is a placeholder. In a real application, you would:
  // 1. Upload the file to your blob storage.
  // 2. Get the public URL of the uploaded file.
  // 3. Save that URL to the database.
  
  const placeholderUrl = "/placeholder-user.jpg"; 

  await query(
    `
    UPDATE users 
    SET avatar_url = ?, updated_at = NOW()
    WHERE id = ?
  `,
    [placeholderUrl, user.id],
  )

  return { success: true, avatarUrl: placeholderUrl }
}

export async function updateOnboardingAction(formData: FormData) {
  try {
    const subjects = formData.get("subjects") as string
    const studyGoal = formData.get("studyGoal") as string
    const difficulty = formData.get("difficulty") as string

    const dataToUpdate = {
      preferred_subjects: JSON.parse(subjects),
      study_goal: parseInt(studyGoal, 10),
      difficulty_level: difficulty,
    };

    return await updateUserProfile(dataToUpdate);
  } catch (error) {
    console.error("Error updating onboarding info:", error);
    return { error: "Não foi possível atualizar suas preferências." };
  }
}
