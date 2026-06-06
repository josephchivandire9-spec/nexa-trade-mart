import { createFileRoute } from "@tanstack/react-router";
import { Copy, Share2, Users, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useReferrals } from "@/hooks/useReferrals";
import { toast } from "sonner";

export const Route = createFileRoute("/account/referrals")({
  head: () => ({ meta: [{ title: "Referrals — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const { profile, loading } = useProfile();
  const { referrals, loading: rLoading } = useReferrals();

  if (loading || rLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  const code = profile?.referral_code ?? "—";
  const link = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${code}` : "";

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    toast.success("Copied to clipboard");
  }

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: "NEXA TRADE MART", text: "Shop with me on NEXA TRADE MART", url: link }); } catch {}
    } else copy(link);
  }

  const approved = referrals.filter((r) => r.status === "approved").length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-6">
        <h1 className="font-display text-2xl">Referral Program</h1>
        <p className="text-sm text-muted-foreground">Share your link. Earn 100 points when a friend's first order is delivered.</p>

        <div className="mt-5 rounded-xl bg-gold/15 border border-gold/40 p-4">
          <div className="text-[11px] uppercase tracking-widest text-gold-deep">Your code</div>
          <div className="font-display text-2xl text-gold-deep mt-1">{code}</div>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input readOnly value={link} className="flex-1 h-11 rounded-lg border bg-background px-3 text-sm" />
          <button onClick={() => copy(link)} className="h-11 px-4 rounded-lg border inline-flex items-center justify-center gap-2 text-sm">
            <Copy className="h-4 w-4" /> Copy
          </button>
          <button onClick={share} className="h-11 px-4 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 text-sm">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-display text-lg flex items-center gap-2"><Users className="h-4 w-4" /> Your referrals ({referrals.length}, {approved} approved)</h2>
        {referrals.length === 0 && <p className="text-sm text-muted-foreground mt-3">No referrals yet.</p>}
        <div className="mt-3 divide-y">
          {referrals.map((r) => (
            <div key={r.id} className="py-3 flex items-center justify-between text-sm">
              <span className="font-mono text-xs">{r.referred_id.slice(0, 8).toUpperCase()}</span>
              <span>{new Date(r.created_at).toLocaleDateString()}</span>
              <span className={`text-[10px] uppercase tracking-widest ${r.status === "approved" ? "text-emerald-600" : "text-muted-foreground"}`}>{r.status}</span>
              <span className="font-bold">+{r.reward_points} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
