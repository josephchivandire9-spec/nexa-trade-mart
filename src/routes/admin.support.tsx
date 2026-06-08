import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupport,
});

function AdminSupport() {
  const { data: messages = [] } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () =>
      (await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">Customer messages and inquiries.</p>
        </div>
        <Link to="/admin/messages" className="h-11 px-4 rounded-lg bg-ink text-white text-sm font-medium inline-flex items-center gap-2">
          Open inbox <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No tickets yet.</div>
        ) : (
          <ul className="divide-y">
            {(messages as any[]).map((m) => (
              <li key={m.id} className="p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-muted inline-flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{m.name} {!m.is_read && <span className="ml-2 text-[10px] uppercase tracking-widest text-gold-deep">new</span>}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.email} · {new Date(m.created_at).toLocaleString()}</div>
                  <div className="text-sm mt-1 line-clamp-2">{m.subject ? <strong>{m.subject}: </strong> : null}{m.message}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
