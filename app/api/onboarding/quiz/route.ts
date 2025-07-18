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

    const { course, year } = await req.json()

    if (!course || !year) {
      return NextResponse.json({ error: "Curso e ano são obrigatórios" }, { status: 400 })
    }

    // Buscar o ID do curso
    const courses = await query("SELECT id FROM courses WHERE name = ?", [course])
    const courseId = (courses as any[])[0]?.id

    if (!courseId) {
      return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 })
    }

    // Atualizar o perfil do usuário
    await query(
      "UPDATE users SET course_id = ?, class_year = ? WHERE id = ?",
      [courseId, year.toString(), user.id]
    )

    // Criar tópicos de estudo baseados no ano do usuário
    const disciplinesByYear = {
      1: ["Língua Portuguesa", "Inglês Técnico", "Matemática", "FAI", "Física", "Química", "Educação Física", "TIC", "SEAC", "Electrotecnia", "TLP"],
      2: ["Língua Portuguesa", "Inglês Técnico", "Matemática", "FAI", "Física", "Química", "TIC", "SEAC", "Electrotecnia", "TLP"],
      3: ["Matemática", "FAI", "Física", "Química", "TIC", "SEAC", "Electrotecnia", "TREI", "OGI", "TLP"],
      4: ["PT - Projeto Tecnológico"]
    }

    const userDisciplines = disciplinesByYear[year as keyof typeof disciplinesByYear] || []

    // Buscar disciplinas do banco
    const placeholders = userDisciplines.map(() => '?').join(',');
    const disciplines = await query(
      `SELECT id, name FROM disciplines WHERE course_id = ? AND name IN (${placeholders})`,
      [courseId, ...userDisciplines]
    )

    // Criar tópicos de estudo para cada disciplina
    for (const discipline of disciplines as any[]) {
      // Verificar se já existe tópico para esta disciplina
      const existingTopic = await query(
        "SELECT id FROM study_topics WHERE discipline_id = ? AND user_id = ?",
        [discipline.id, user.id]
      )

      if ((existingTopic as any[]).length === 0) {
        // Criar tópico padrão para a disciplina
        await query(
          `
          INSERT INTO study_topics (
            user_id, discipline_id, title, subject, level, description, 
            progress, total_time_minutes, completed, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, false, NOW(), NOW())
        `,
          [
            user.id,
            discipline.id,
            `Introdução a ${discipline.name}`,
            discipline.name,
            'medio',
            `Conteúdo inicial da disciplina ${discipline.name}`,
          ]
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Perfil configurado com sucesso",
      course,
      year,
      disciplines: userDisciplines
    })
  } catch (error: any) {
    console.error("Erro ao configurar perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 