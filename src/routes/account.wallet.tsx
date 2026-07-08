import { createFileRoute } from "@tanstack/react-router";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { formatZAR } from "@/lib/shopify";
import { toast } from "sonner";

export const Route = createFileRoute("/account/wallet")({
  head: () => ({ meta: [{ title: "Wallet — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: WalletPage,
});

const TX: { id: string; type: "credit" | "debit"; amount: number; desc: string; date: string }[] = [];

function WalletPage() {
  const balance = 0;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-ink text-white p-6 shadow-premium">
        <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-gold flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" /> Nexa Wallet
            </div>
            <div className="text-[11px] uppercase tracking-widest text-white/60 mt-4">Available Balance</div>
            <div className="font-display text-4xl mt-1">{formatZAR(balance)}</div>
          </div>
          <div className="text-right text-[10px] text-white/60">
            <div>•••• 4821</div>
            <div className="mt-1">Coming Soon</div>
          </div>
        </div>
        <div className="relative mt-6 flex gap-2">
          <button onClick={() => toast("Wallet top-ups launch in the next update")}
            className="h-10 px-4 rounded-lg gradient-gold text-ink font-bold text-sm inline-flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Top Up
          </button>
          <button onClick={() => toast("Withdrawals will be available soon")}
            className="h-10 px-4 rounded-lg border border-white/20 text-white font-medium text-sm inline-flex items-center gap-1.5 hover:bg-white/10">
            <ArrowUpRight className="h-4 w-4" /> Withdraw
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <h2 className="font-display text-lg flex items-center gap-2"><Clock className="h-4 w-4 text-gold-deep" /> Transaction History</h2>
        {TX.length === 0 ? (
          <div className="mt-5 text-center py-10">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted inline-flex items-center justify-center">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">No transactions yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Your wallet activity will appear here once available.</p>
          </div>
        ) : (
          <ul className="mt-3 divide-y">
            {TX.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full grid place-items-center ${t.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {t.type === "credit" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.desc}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className={`font-bold text-sm ${t.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type === "credit" ? "+" : "-"}{formatZAR(t.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
