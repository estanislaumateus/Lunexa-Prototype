import { StudyInterface } from "@/components/study/study-interface"

export default function StudyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Área de Estudo</h2>
        <p className="text-muted-foreground">Explore tópicos e aprenda com conteúdo gerado por IA</p>
      </div>

      <StudyInterface />
    </div>
  )
}
