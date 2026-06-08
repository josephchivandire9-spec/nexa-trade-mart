import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";

export const Route = createFileRoute("/admin/ai")({
  component: AdminAI,
});

function AdminAI() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">AI Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitoring and configuration for the customer AI assistant.</p>
      </div>

      <div className="rounded-2xl border bg-card p-8 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-700 text-white inline-flex items-center justify-center">
          <Bot className="h-7 w-7" />
        </div>
        <h2 className="font-display text-xl mt-4">AI Assistant is live</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          The store assistant is active on the storefront and answering customer questions in real time.
          Detailed escalation analytics will appear here.
        </p>
      </div>
    </div>
  );
}
