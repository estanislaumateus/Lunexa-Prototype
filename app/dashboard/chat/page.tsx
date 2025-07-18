import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Chat com IA</h2>
        <p className="text-muted-foreground">Tire suas dúvidas com nossos assistentes inteligentes</p>
      </div>

      <ChatInterface />
    </div>
  )
}
