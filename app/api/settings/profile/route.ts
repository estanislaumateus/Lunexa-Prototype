import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/database"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const formData = await req.formData()
    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const phone = formData.get("phone") as string
    const studyGoal = formData.get("studyGoal") as string
    const difficultyLevel = formData.get("difficultyLevel") as string
    const notificationsEnabled = formData.get("notificationsEnabled") === "on"
    const studyReminders = formData.get("studyReminders") === "on"
    const assessmentAlerts = formData.get("assessmentAlerts") === "on"
    const avatarFile = formData.get("avatar") as File | null

    let avatarUrl = null

    // Processar upload de imagem
    if (avatarFile && typeof avatarFile === "object" && avatarFile.size > 0) {
      try {
        // Criar diretório se não existir
        const uploadDir = join(process.cwd(), "public", "uploads", "avatars")
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        // Gerar nome único para o arquivo
        const timestamp = Date.now()
        const fileExtension = avatarFile.name.split('.').pop()
        const fileName = `avatar_${user.id}_${timestamp}.${fileExtension}`
        const filePath = join(uploadDir, fileName)

        // Converter File para Buffer
        const arrayBuffer = await avatarFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Salvar arquivo
        await writeFile(filePath, buffer)

        // URL relativa para o frontend
        avatarUrl = `/uploads/avatars/${fileName}`
      } catch (error) {
        console.error("Erro ao processar upload:", error)
        return NextResponse.json({ error: "Erro ao processar imagem" }, { status: 500 })
      }
    }

    // Atualizar perfil do usuário
    const updateFields = []
    const updateValues = []

    if (name) {
      updateFields.push("name = ?")
      updateValues.push(name)
    }

    if (bio !== null) {
      updateFields.push("bio = ?")
      updateValues.push(bio)
    }

    if (phone !== null) {
      updateFields.push("phone = ?")
      updateValues.push(phone)
    }

    if (avatarUrl) {
      updateFields.push("avatar_url = ?")
      updateValues.push(avatarUrl)
    }

    if (updateFields.length > 0) {
      updateValues.push(user.id)
      await query(
        `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      )
    }

    // Atualizar configurações do usuário
    await query(
      `
      INSERT INTO user_settings (user_id, study_goal, difficulty_level, notifications_enabled, study_reminders, assessment_alerts)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        study_goal = VALUES(study_goal),
        difficulty_level = VALUES(difficulty_level),
        notifications_enabled = VALUES(notifications_enabled),
        study_reminders = VALUES(study_reminders),
        assessment_alerts = VALUES(assessment_alerts)
      `,
      [
        user.id,
        parseInt(studyGoal) || 2,
        difficultyLevel || 'medium',
        notificationsEnabled,
        studyReminders,
        assessmentAlerts
      ]
    )

    return NextResponse.json({ 
      success: true, 
      message: "Perfil atualizado com sucesso",
      avatarUrl
    })
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 