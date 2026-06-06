import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/rewards")({
  head: () => ({ meta: [{ title: "Rewards Admin — NEXA TRADE MART" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminRewards,
});

interface Row {
  id: string; user_id: string; points: number; reason: string; status: string; created_at: string;
}
interface ProfileLite { id: string; full_name: string | null; email: string | null; customer_code: string | null }

function AdminRewards() {
  const [rows, setRows] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("reward_points")
      .select("id,user_id,points,reason,status,created_at")
      .order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    const list = (data as Row[]) ?? [];
    setRows(list);
    const ids = Array.from(new Set(list.map((r) => r.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles")
        .select("id,full_name,email,customer_code").in("id", ids);
      const map: Record<string, ProfileLite> = {};
      (profs ?? []).forEach((p: ProfileLite) => { map[p.id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: "approved" | "rejected") {
    const { error } = await supabase.from("reward_points").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(status); load(); }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl">Rewards Queue</h1>
        <p className="text-sm text-muted-foreground">Approve or reject point awards.</p>
      </div>
      <div className="flex gap-2 text-xs">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-9 px-4 rounded-full border ${filter === f ? "bg-ink text-white" : "hover:bg-muted"}`}>
            {f}
          </button>
        ))}
      </div>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left p-3">Customer</th><th className="text-left p-3">Reason</th><th className="text-right p-3">Points</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = profiles[r.user_id];
                return (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{p?.full_name || p?.email || "—"}</div>
                    <div className="text-xs text-muted-foreground">{p?.customer_code}</div>
                  </td>
                  <td className="p-3">{r.reason}</td>
                  <td className="p-3 text-right font-bold">+{r.points}</td>
                  <td className="p-3 capitalize">{r.status}</td>
                  <td className="p-3 text-right">
                    {r.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setStatus(r.id, "approved")} className="p-2 rounded-full bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setStatus(r.id, "rejected")} className="p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"><X className="h-4 w-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No entries</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
