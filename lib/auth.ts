import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { query } from "./database"
import type { User } from "./database"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as number }
  } catch {
    return null
  }
}

export async function getCurrentUser(token?: string): Promise<User | null> {
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const users = await query("SELECT * FROM users WHERE id = ?", [payload.userId])

  return (users as User[])[0] || null
}

export async function createUser(
  name: string, 
  email: string, 
  password: string
): Promise<User> {
  const hashedPassword = await hashPassword(password)
  console.log('🔑 Hash gerado no cadastro:', hashedPassword, 'Tamanho:', hashedPassword.length);
  const result = await query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", 
    [name, email, hashedPassword]
  )

  const insertId = (result as any).insertId

  // Buscar o usuário criado
  const users = await query("SELECT * FROM users WHERE id = ?", [insertId])
  const user = (users as User[])[0]

  // Criar configurações padrão para o usuário
  await query("INSERT INTO user_settings (user_id) VALUES (?)", [user.id])

  return user
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const users = await query("SELECT * FROM users WHERE email = ?", [email])
  const user = (users as User[])[0]
  if (!user) {
    console.log('❌ Usuário não encontrado:', email);
    return null
  }
  console.log('🔐 Hash no banco:', user.password_hash, 'Tamanho:', user.password_hash?.length);
  const isValid = await verifyPassword(password, user.password_hash)
  console.log('🔑 Senha válida?', isValid);
  if (!isValid) return null

  return user
}
