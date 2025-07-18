"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Bem-vindo de volta à Lunexa</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Faça login para continuar na sua jornada de aprendizado.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar na Plataforma</CardTitle>
            <CardDescription>Acesse sua conta para continuar seus estudos</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Cadastre-se gratuitamente
          </Link>
        </div>
      </div>
    </div>
  )
} 