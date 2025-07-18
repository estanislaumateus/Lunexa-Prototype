import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/database"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const formData = await req.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const priority = formData.get("priority") as string
    const contact = formData.get("contact") as string
    const feedbackType = formData.get("feedbackType") as string
    const rating = parseInt(formData.get("rating") as string)

    if (!title || !description || !category || !priority) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    // Inserir feedback no banco de dados
    const result = await query(
      `
      INSERT INTO feedback (
        user_id, title, description, category, priority, 
        contact_email, feedback_type, rating, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
      [user.id, title, description, category, priority, contact || null, feedbackType, rating]
    )

    // Criar notificação para o admin
    await query(
      `
      INSERT INTO notifications (user_id, title, message, type, metadata)
      VALUES (?, ?, ?, ?, ?)
    `,
      [
        user.id,
        "Feedback Enviado",
        `Seu feedback "${title}" foi recebido e está sendo analisado.`,
        "feedback",
        JSON.stringify({ feedbackId: (result as any).insertId, category, priority })
      ]
    )

    return NextResponse.json({ 
      success: true, 
      message: "Feedback enviado com sucesso",
      feedbackId: (result as any).insertId
    })
  } catch (error: any) {
    console.error("Erro ao processar feedback:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 