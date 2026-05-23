import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const qc = useQueryClient();
  const { data: msgs = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () =>
      (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function markRead(id: string) {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }
  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Customer Messages</h1>
      <p className="text-sm text-muted-foreground mt-1">{msgs.length} total</p>
      <div className="mt-6 space-y-3">
        {msgs.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">No messages yet.</div>
        )}
        {(msgs as any[]).map((m) => (
          <div key={m.id} className={`rounded-2xl border bg-card p-5 ${!m.is_read ? "border-gold/40" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{m.name} {!m.is_read && <span className="ml-2 text-[10px] uppercase tracking-widest text-gold">New</span>}</div>
                <div className="text-xs text-muted-foreground">{m.email} {m.phone ? `· ${m.phone}` : ""}</div>
                {m.subject && <div className="text-xs mt-1 font-semibold">{m.subject}</div>}
              </div>
              <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</div>
            </div>
            <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
            <div className="mt-3 flex gap-2">
              {!m.is_read && (
                <button onClick={() => markRead(m.id)} className="h-8 px-3 rounded-lg border text-xs inline-flex items-center gap-1">
                  <Check className="h-3 w-3" /> Mark read
                </button>
              )}
              <button onClick={() => remove(m.id)} className="ml-auto h-8 w-8 inline-flex items-center justify-center rounded text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
