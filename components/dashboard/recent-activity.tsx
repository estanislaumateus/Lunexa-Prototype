"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, CheckCircle, MessageSquare, Trophy } from "lucide-react"

type Discipline = { id: number; course_id: number; name: string };
type Activity = { discipline_id: number; [key: string]: any };
type User = { course_id: number };

export function RecentActivity({ user, activities = [] }: { user: User; activities: Activity[] }) {
  const [userDisciplines, setUserDisciplines] = useState<Discipline[]>([]);

  useEffect(() => {
    async function fetchDisciplines() {
      if (!user?.course_id) return;
      const res = await fetch(`/api/disciplines?courseId=${user.course_id}`);
      const data = await res.json();
      setUserDisciplines(Array.isArray(data) ? data : []);
    }
    fetchDisciplines();
  }, [user?.course_id]);

  // IDs das disciplinas do curso do usuário
  const userCourseDisciplines = Array.isArray(userDisciplines)
    ? userDisciplines.map((d: Discipline) => d.id)
    : [];

  // Garante que activities é array
  const safeActivities: Activity[] = Array.isArray(activities) ? activities : [];

  // Filtrar atividades para mostrar apenas as do curso e disciplinas do usuário
  const filteredActivities = safeActivities.filter((a: Activity) =>
    userCourseDisciplines.includes(a.discipline_id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Suas últimas ações na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.map((activity: Activity, index: number) => (
            <div key={index} className="flex items-center space-x-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
