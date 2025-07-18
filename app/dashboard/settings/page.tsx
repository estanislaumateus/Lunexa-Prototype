import { SettingsInterface } from "@/components/settings/settings-interface"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Personalize sua conta e preferências de estudo</p>
      </div>

      <SettingsInterface />
    </div>
  )
}
