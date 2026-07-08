import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package, Truck, Gift, Heart, Wallet, Ticket, MapPin, Bell,
  Sparkles, TrendingUp, ArrowRight, Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRewards } from "@/hooks/useRewards";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";

export const Route = createFileRoute("/account/")({
  head: () => ({ meta: [{ title: "Dashboard — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

const IN_TRANSIT = new Set(["confirmed", "processing", "packed", "shipped"]);

function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { approved: rewardPoints, pending: rewardPending } = useRewards();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("id,total,status,created_at,items")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });
      const list = (orders ?? []) as any[];
      return {
        total: list.length,
        inTransit: list.filter((o) => IN_TRANSIT.has(o.status)).length,
        delivered: list.filter((o) => o.status === "delivered").length,
        recent: list.slice(0, 3),
        spent: list.filter((o) => o.status !== "cancelled")
          .reduce((s, o) => s + Number(o.total || 0), 0),
      };
    },
  });

  const firstName = (profile?.full_name || user?.email || "friend").split(" ")[0].split("@")[0];

  // Membership tiers based on approved points
  const tiers = [
    { name: "Bronze", min: 0 },
    { name: "Silver", min: 200 },
    { name: "Gold", min: 500 },
    { name: "Platinum", min: 1500 },
  ];
  const current = [...tiers].reverse().find((t) => rewardPoints >= t.min)!;
  const next = tiers.find((t) => t.min > rewardPoints);
  const progress = next
    ? Math.min(100, ((rewardPoints - current.min) / (next.min - current.min)) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-ink text-white p-6 md:p-8 shadow-premium">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.25em] text-gold">Welcome back</div>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Hello, {firstName}</h1>
          <p className="text-white/70 text-sm mt-2 max-w-md">
            Your personal shopping space — track orders, earn rewards and manage everything in one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/shop" className="h-10 px-5 rounded-lg gradient-gold text-ink font-bold inline-flex items-center gap-2 text-sm hover:opacity-90 transition">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/account/profile" className="h-10 px-5 rounded-lg border border-white/20 text-white font-medium inline-flex items-center gap-2 text-sm hover:bg-white/10 transition">
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Orders" value={stats?.total ?? 0} to="/account/orders" />
        <StatCard icon={Truck} label="In Transit" value={stats?.inTransit ?? 0} to="/account/tracking" accent />
        <StatCard icon={Sparkles} label="Reward Points" value={rewardPoints} sub={rewardPending ? `${rewardPending} pending` : undefined} to="/account/rewards" />
        <StatCard icon={TrendingUp} label="Total Spent" value={formatZAR(stats?.spent ?? 0)} to="/account/orders" />
      </div>

      {/* Membership card */}
      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gold-deep">Membership</div>
            <h2 className="font-display text-2xl mt-1">{current.name} Member</h2>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Points</div>
            <div className="font-display text-2xl text-gold-deep">{rewardPoints}</div>
          </div>
        </div>
        {next ? (
          <>
            <div className="mt-4 h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-gold rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{current.name}</span>
              <span>{next.min - rewardPoints} pts to {next.name}</span>
            </div>
          </>
        ) : (
          <div className="mt-4 text-sm text-gold-deep font-semibold">You've reached the highest tier — enjoy exclusive perks!</div>
        )}
      </div>

      {/* Quick access grid */}
      <div>
        <h2 className="font-display text-xl mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <QuickCard to="/account/wishlist" icon={Heart} title="Wishlist" desc="Saved items" tint="rose" />
          <QuickCard to="/account/coupons" icon={Ticket} title="Coupons" desc="Available offers" tint="emerald" />
          <QuickCard to="/account/wallet" icon={Wallet} title="Wallet" desc="Balance & top-ups" tint="indigo" />
          <QuickCard to="/account/addresses" icon={MapPin} title="Addresses" desc="Shipping details" tint="amber" />
          <QuickCard to="/account/notifications" icon={Bell} title="Notifications" desc="Latest updates" tint="sky" />
          <QuickCard to="/promotions" icon={Sparkles} title="Promotions" desc="What's hot now" tint="gold" />
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl flex items-center gap-2"><Clock className="h-4 w-4 text-gold-deep" /> Recent Activity</h2>
          <Link to="/account/orders" className="text-xs font-semibold text-gold-deep hover:underline">View all</Link>
        </div>
        {stats?.recent?.length ? (
          <ul className="divide-y">
            {stats.recent.map((o: any) => (
              <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">Order #{o.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()} · {(o.items as any[])?.length ?? 0} items</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold">{formatZAR(o.total)}</div>
                  <StatusPill status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No activity yet. Start shopping to see updates here.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, to, accent }: {
  icon: typeof Package; label: string; value: React.ReactNode; sub?: string; to: string; accent?: boolean;
}) {
  return (
    <Link to={to} className={`group rounded-2xl border p-4 card-hover ${accent ? "bg-gold/10 border-gold/40" : "bg-card"}`}>
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-lg inline-flex items-center justify-center ${accent ? "bg-gold text-ink" : "bg-muted"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-2xl mt-0.5">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </Link>
  );
}

const tintClasses: Record<string, string> = {
  rose: "bg-rose-100 text-rose-700",
  emerald: "bg-emerald-100 text-emerald-700",
  indigo: "bg-indigo-100 text-indigo-700",
  amber: "bg-amber-100 text-amber-800",
  sky: "bg-sky-100 text-sky-700",
  gold: "bg-gold/25 text-gold-deep",
};

function QuickCard({ to, icon: Icon, title, desc, tint }: {
  to: string; icon: typeof Heart; title: string; desc: string; tint: string;
}) {
  return (
    <Link to={to} className="group rounded-2xl border bg-card p-4 card-hover flex items-start gap-3">
      <div className={`h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0 ${tintClasses[tint]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{desc}</div>
      </div>
    </Link>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-blue-100 text-blue-900",
  processing: "bg-blue-100 text-blue-900",
  packed: "bg-indigo-100 text-indigo-900",
  shipped: "bg-purple-100 text-purple-900",
  delivered: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${STATUS_COLORS[status] ?? "bg-muted"}`}>
      {status}
    </span>
  );
}
