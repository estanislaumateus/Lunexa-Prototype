"use server"

import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/database"
import { redirect } from "next/navigation"
import { hashPassword } from "@/lib/auth"

async function verifyAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        redirect('/dashboard');
    }
    return user;
}

export async function getAdminDashboardStats() {
    await verifyAdmin();
    
    const usersCount = await query("SELECT COUNT(*) as count FROM users");
    const topicsCount = await query("SELECT COUNT(*) as count FROM study_topics");
    const assessmentsCount = await query("SELECT COUNT(*) as count FROM assessments");
    const coursesCount = await query("SELECT COUNT(*) as count FROM courses");
    const disciplinesCount = await query("SELECT COUNT(*) as count FROM disciplines");

    return {
        users: (usersCount as any[])[0].count,
        topics: (topicsCount as any[])[0].count,
        assessments: (assessmentsCount as any[])[0].count,
        courses: (coursesCount as any[])[0].count,
        disciplines: (disciplinesCount as any[])[0].count,
    }
}

// Função para buscar todos os cursos
export async function getCourses() {
    await verifyAdmin();
    
    const courses = await query("SELECT * FROM courses ORDER BY name");
    return courses;
}

// Função para buscar disciplinas de um curso
export async function getDisciplinesByCourse(courseId: number) {
    await verifyAdmin();
    
    const disciplines = await query(
        "SELECT * FROM disciplines WHERE course_id = ? ORDER BY name",
        [courseId]
    );
    return disciplines;
}

// Função para criar novo curso
export async function createCourse(name: string, description: string, level: string, durationMonths: number) {
    await verifyAdmin();
    
    const result = await query(
        "INSERT INTO courses (name, description, level, duration_months) VALUES (?, ?, ?, ?)",
        [name, description, level, durationMonths]
    );
    
    return { success: true, courseId: (result as any).insertId };
}

// Função para criar nova disciplina
export async function createDiscipline(courseId: number, name: string, description: string, code?: string, credits?: number, semester?: number) {
    await verifyAdmin();
    
    const result = await query(
        "INSERT INTO disciplines (course_id, name, description, code, credits, semester) VALUES (?, ?, ?, ?, ?, ?)",
        [courseId, name, description, code || null, credits || 0, semester || null]
    );
    
    return { success: true, disciplineId: (result as any).insertId };
}

// Função para criar novo admin
export async function createAdmin(name: string, email: string, password: string) {
    await verifyAdmin();
    
    const hashedPassword = await hashPassword(password);
    
    const result = await query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
        [name, email, hashedPassword]
    );
    
    return { success: true, adminId: (result as any).insertId };
} 