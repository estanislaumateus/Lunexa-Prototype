"use server"

import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/database"
import { chatWithAI, AIProvider } from "@/lib/ai"
import type { ChatMessage } from "@/lib/database"

const AI_PROVIDER_ROTATION: AIProvider[] = ["cohere", "google", "anthropic"];
const MESSAGE_LIMIT_PER_PROVIDER = 20;

async function selectAiProvider(userId: number): Promise<{ provider: AIProvider; switched: boolean }> {
  const lastMessage = await query(
    `SELECT ai_provider FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  let currentProvider: AIProvider = "cohere";
  if ((lastMessage as any[]).length > 0) {
    currentProvider = (lastMessage as any[])[0].ai_provider as AIProvider;
  }

  const messageCountResult = await query(
    `SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ? AND ai_provider = ?`,
    [userId, currentProvider]
  );

  const messageCount = (messageCountResult as any[])[0].count;

  if (messageCount >= MESSAGE_LIMIT_PER_PROVIDER) {
    const currentIndex = AI_PROVIDER_ROTATION.indexOf(currentProvider);
    const nextProvider = AI_PROVIDER_ROTATION[(currentIndex + 1) % AI_PROVIDER_ROTATION.length];
    return { provider: nextProvider, switched: true };
  }

  return { provider: currentProvider, switched: false };
}

export async function sendChatMessage(message: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  try {
    const { provider: aiProvider, switched } = await selectAiProvider(user.id);

    // Buscar contexto das últimas mensagens
    const recentMessages = await query(
      `
      SELECT message, response FROM chat_messages
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `,
      [user.id],
    )

    const context = (recentMessages as any[])
      .reverse()
      .map((m: any) => `Usuário: ${m.message}\nIA: ${m.response}`)
      .join("\n\n")

    // Gerar resposta com IA
    const aiResponse = await chatWithAI(message, context, aiProvider)

    // Salvar mensagem no banco
    const result = await query(
      `
      INSERT INTO chat_messages (user_id, message, response, ai_provider, context)
      VALUES (?, ?, ?, ?, ?)
    `,
      [user.id, message, aiResponse.response, aiResponse.provider, JSON.stringify({ context })],
    )

    const insertId = (result as any).insertId
    const messages = await query("SELECT * FROM chat_messages WHERE id = ?", [insertId])

    let notification;
    if (switched) {
        notification = `Para garantir a continuidade do serviço, seu assistente foi trocado para ${aiResponse.provider}.`
    }

    return {
      success: true,
      message: (messages as ChatMessage[])[0],
      notification: notification
    }
  } catch (error) {
    console.error("Erro no chat:", error)
    return { error: "Erro ao processar mensagem. Tente novamente." }
  }
}

export async function getChatHistory() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const messages = await query(
    `
    SELECT * FROM chat_messages
    WHERE user_id = ?
    ORDER BY created_at ASC
    LIMIT 50
  `,
    [user.id],
  )

  return messages as ChatMessage[]
}

export async function clearChatHistory() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  await query("DELETE FROM chat_messages WHERE user_id = ?", [user.id])

  return { success: true }
}
