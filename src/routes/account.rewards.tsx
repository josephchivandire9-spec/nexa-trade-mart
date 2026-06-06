import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Gift, Sparkles } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";

export const Route = createFileRoute("/account/rewards")({
  head: () => ({ meta: [{ title: "Rewards — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: RewardsPage,
});

function RewardsPage() {
  const { entries, loading, approved, pending } = useRewards();
  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-6">
        <h1 className="font-display text-2xl">Rewards Center</h1>
        <p className="text-sm text-muted-foreground">Earn 1 point per R10 spent. Points unlock once your order is delivered.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gold/15 border border-gold/40 p-4">
            <div className="text-[11px] uppercase tracking-widest text-gold-deep">Available</div>
            <div className="font-display text-3xl text-gold-deep flex items-center gap-2 mt-1"><Sparkles className="h-5 w-5" /> {approved}</div>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Pending</div>
            <div className="font-display text-3xl mt-1">{pending}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-display text-lg flex items-center gap-2"><Gift className="h-4 w-4" /> History</h2>
        {entries.length === 0 && <p className="text-sm text-muted-foreground mt-3">No reward activity yet.</p>}
        <div className="mt-3 divide-y">
          {entries.map((e) => (
            <div key={e.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{e.reason}</div>
                <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold">+{e.points}</div>
                <div className={`text-[10px] uppercase tracking-widest ${e.status === "approved" ? "text-emerald-600" : e.status === "rejected" ? "text-destructive" : "text-muted-foreground"}`}>{e.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
