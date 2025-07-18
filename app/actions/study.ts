"use server"

import { cookies } from "next/headers"
import { google } from "googleapis"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/database"
import { generateEducationalContent, suggestStudyTopics } from "@/lib/ai"
import type { StudyTopic, StudySession } from "@/lib/database"

export async function getStudyTopics() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Buscar tópicos globais e do usuário
  const topics = await query(
    `
    SELECT st.*, d.name as discipline_name 
    FROM study_topics st
    LEFT JOIN disciplines d ON st.discipline_id = d.id
    LEFT JOIN courses c ON d.course_id = c.id
    WHERE (st.user_id = ? OR st.user_id IS NULL)
    AND (c.id = ? OR c.id IS NULL)
    ORDER BY st.created_at DESC
  `,
    [user.id, user.course_id],
  )

  return topics
}

export async function createStudyTopic(title: string, subject: string, level: string, description?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  try {
    // Gerar conteúdo com IA
    const aiContent = await generateEducationalContent(title, subject, level)

    const result = await query(
      `
      INSERT INTO study_topics (user_id, title, subject, level, description, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [user.id, title, subject, level, description || "", aiContent.content],
    )

    const insertId = (result as any).insertId
    const topics = await query("SELECT * FROM study_topics WHERE id = ?", [insertId])

    return { success: true, topic: (topics as StudyTopic[])[0], aiProvider: aiContent.provider }
  } catch (error) {
    console.error("Erro ao criar tópico:", error)
    return { error: "Erro ao gerar conteúdo. Tente novamente." }
  }
}

export async function getStudyTopicContent(topicId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const topics = await query(
    `
    SELECT * FROM study_topics 
    WHERE id = ? AND (user_id = ? OR user_id IS NULL)
  `,
    [topicId, user.id],
  )

  const topic = (topics as StudyTopic[])[0]

  if (!topic) {
    throw new Error("Tópico não encontrado")
  }

  // Se não tem conteúdo, gerar com IA
  if (!topic.content) {
    try {
      const aiContent = await generateEducationalContent(topic.title, topic.subject, topic.level)

      await query(
        `
        UPDATE study_topics 
        SET content = ?
        WHERE id = ?
      `,
        [aiContent.content, topicId],
      )

      topic.content = aiContent.content
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error)
    }
  }

  return topic
}

export async function startStudySession(topicId: number) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const topic = await query("SELECT * FROM study_topics WHERE id = ?", [topicId])

  if (!(topic as any[])[0]) {
    throw new Error("Tópico não encontrado")
  }

  return { success: true, startTime: new Date().toISOString() }
}

export async function endStudySession(topicId: number, startTime: string, progressIncrease = 10, notes?: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const start = new Date(startTime)
  const end = new Date()
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

  // Buscar progresso atual
  const topic = await query("SELECT progress FROM study_topics WHERE id = ?", [topicId])
  const currentProgress = (topic as any[])[0]?.progress || 0
  const newProgress = Math.min(100, currentProgress + progressIncrease)

  // Atualizar progresso do tópico
  await query(
    `
    UPDATE study_topics 
    SET progress = ?, 
        total_time_minutes = total_time_minutes + ?,
        completed = ?
    WHERE id = ?
  `,
    [newProgress, durationMinutes, newProgress >= 100, topicId],
  )

  // Registrar sessão de estudo
  const result = await query(
    `
    INSERT INTO study_sessions (
      user_id, topic_id, duration_minutes, date, notes, 
      progress_before, progress_after
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
    [
      user.id,
      topicId,
      durationMinutes,
      new Date().toISOString().split("T")[0],
      notes || "",
      currentProgress,
      newProgress,
    ],
  )

  const insertId = (result as any).insertId
  const sessions = await query("SELECT * FROM study_sessions WHERE id = ?", [insertId])

  return {
    success: true,
    session: (sessions as StudySession[])[0],
    newProgress,
    durationMinutes,
  }
}

export async function getStudyHistory() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const sessions = await query(
    `
    SELECT 
      ss.*,
      st.title as topic_title,
      st.subject
    FROM study_sessions ss
    JOIN study_topics st ON ss.topic_id = st.id
    WHERE ss.user_id = ?
    ORDER BY ss.created_at DESC
    LIMIT 50
  `,
    [user.id],
  )

  return sessions
}

export async function getStudySchedule() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Exemplo de retorno de agenda baseado em sessões de estudo
  const schedule = await query(
    `
    SELECT 
      st.title,
      ss.date,
      ss.duration_minutes
    FROM study_sessions ss
    JOIN study_topics st ON ss.topic_id = st.id
    WHERE ss.user_id = ?
    ORDER BY ss.date DESC
    LIMIT 30
  `,
    [user.id],
  )

  return schedule
}


export async function getStudyStats() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Estatísticas gerais
  const stats = await query(
    `
    SELECT 
      COUNT(DISTINCT ss.topic_id) as topics_studied,
      SUM(ss.duration_minutes) as total_minutes,
      COUNT(ss.id) as total_sessions,
      AVG(ss.duration_minutes) as avg_session_duration
    FROM study_sessions ss
    WHERE ss.user_id = ?
  `,
    [user.id],
  )

  // Estatísticas desta semana
  const weekStats = await query(
    `
    SELECT 
      SUM(duration_minutes) as week_minutes,
      COUNT(id) as week_sessions
    FROM study_sessions
    WHERE user_id = ? 
    AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
  `,
    [user.id],
  )

  // Progresso por matéria apenas do curso do usuário
  const subjectProgress = await query(
    `
    SELECT 
      st.subject,
      AVG(st.progress) as avg_progress,
      COUNT(st.id) as topic_count,
      SUM(st.total_time_minutes) as total_time
    FROM study_topics st
    LEFT JOIN disciplines d ON st.discipline_id = d.id
    WHERE st.user_id = ? AND (d.course_id = ? OR d.course_id IS NULL)
    GROUP BY st.subject
  `,
    [user.id, user.course_id],
  )

  return {
    general: (stats as any[])[0],
    week: (weekStats as any[])[0],
    subjects: subjectProgress,
  }
}

export async function getAIStudySuggestions() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  try {
    // Buscar histórico de estudos
    const recentTopics = await query(
      `
      SELECT DISTINCT st.title, st.subject, d.course_id
      FROM study_sessions ss
      JOIN study_topics st ON ss.topic_id = st.id
      LEFT JOIN disciplines d ON st.discipline_id = d.id
      WHERE ss.user_id = ?
      AND (d.course_id = ? OR d.course_id IS NULL)
      ORDER BY ss.created_at DESC
      LIMIT 10
    `,
      [user.id, user.course_id],
    )

    const studyHistory = (recentTopics as any[]).map((t) => `${t.subject}: ${t.title}`)

    const suggestions = await suggestStudyTopics(
      user.difficulty_level,
      user.preferred_subjects?.filter(
        (subject) => subject === String(user.course_id)
      ) || [],
      studyHistory,
    )




    return { suggestions }
  } catch (error) {
    console.error("Erro ao gerar sugestões:", error)
    return { error: "Erro ao gerar sugestões. Tente novamente." }
  }
}

export async function getYoutubeVideos(topic: string, subject?: string, lang = "pt") {
  if (!process.env.YOUTUBE_API_KEY) {
    console.error("YouTube API key is missing.");
    // Return a default video or an empty array if the key is missing
    return [{
      videoId: 'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
      title: 'Configure a YOUTUBE_API_KEY no seu .env',
      description: 'É necessário uma chave de API do YouTube para buscar vídeos. Por favor, adicione-a ao seu arquivo .env.',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    }];
  }

  const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
  });

  // Montar termo de busca mais preciso
  let searchQuery = `${topic} ${subject ? subject : ''} explicação aula tutorial ${lang === 'pt' ? 'em português' : ''}`.trim();

  try {
    const response = await youtube.search.list({
      part: ["snippet"],
      q: searchQuery,
      type: ["video"],
      maxResults: 8,
      relevanceLanguage: lang,
      videoCategoryId: "27", // Education category
      safeSearch: "strict",
    });

    // Filtrar vídeos cujo título contenha o tópico ou a disciplina
    const videos = (response.data.items || [])
      .map((item) => ({
        videoId: item.id?.videoId || "",
        title: item.snippet?.title || "Sem título",
        description: item.snippet?.description || "",
        thumbnail: item.snippet?.thumbnails?.high?.url || "",
      }))
      .filter((video) => {
        const titleLower = video.title.toLowerCase();
        return (
          titleLower.includes(topic.toLowerCase()) ||
          (subject && titleLower.includes(subject.toLowerCase()))
        );
      });

    // Se não encontrar nenhum vídeo relevante, retorna o primeiro da busca
    if (videos.length === 0 && response.data.items && response.data.items.length > 0) {
      return [
        {
          videoId: response.data.items[0].id?.videoId || "",
          title: response.data.items[0].snippet?.title || "Sem título",
          description: response.data.items[0].snippet?.description || "",
          thumbnail: response.data.items[0].snippet?.thumbnails?.high?.url || "",
        },
      ];
    }

    return videos;
  } catch (error) {
    console.error("Erro ao buscar vídeos do YouTube:", error);
    return [];
  }
}
