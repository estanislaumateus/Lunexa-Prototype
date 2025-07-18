"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createUser, authenticateUser, createToken, getCurrentUser } from "@/lib/auth"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

export async function loginAction(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validatedData = loginSchema.parse(data)

    const user = await authenticateUser(validatedData.email, validatedData.password)

    if (!user) {
      return { error: "Email ou senha incorretos" }
    }

    const token = await createToken(user.id)
    const cookieStore = await cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    if (user.role === 'admin') {
      redirect("/admin/dashboard")
    } else {
      redirect("/dashboard")
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Erro interno do servidor" }
  }
}

export async function registerAction(formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validatedData = registerSchema.parse(data)

    const user = await createUser(
      validatedData.name, 
      validatedData.email, 
      validatedData.password
    )

    const token = await createToken(user.id)
    const cookieStore = await cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return { success: true, user: { id: user.id, name: user.name, email: user.email } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return { error: "Este email já está cadastrado" }
    }
    return { error: "Erro interno do servidor" }
  }
}

export async function getCurrentUserProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    throw new Error("Usuário não autenticado")
  }

  const user = await getCurrentUser(token)

  if (!user) {
    throw new Error("Usuário não encontrado")
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    bio: user.bio,
    phone: user.phone,
    study_goal: user.study_goal,
    difficulty_level: user.difficulty_level,
    preferred_subjects: user.preferred_subjects || [],
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
  redirect("/")
}
