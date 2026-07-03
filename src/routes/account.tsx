import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, User, Package, LogOut, Save, MapPin, Truck, Gift, Users, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PhoneInput } from "@/components/PhoneInput";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — NEXA TRADE MART" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

const NAV: { to: string; label: string; icon: typeof User; exact?: boolean }[] = [
  { to: "/account", label: "Profile", icon: User, exact: true },
  { to: "/account/orders", label: "My Orders", icon: Package },
  { to: "/account/tracking", label: "Order Tracking", icon: Truck },
  { to: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { to: "/account/rewards", label: "Rewards Center", icon: Gift },
  { to: "/account/referrals", label: "Referral Program", icon: Users },
  { to: "/account/settings", label: "Settings", icon: SettingsIcon },
];

function AccountLayout() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return null;

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <div className="container-px mx-auto max-w-6xl py-10 grid md:grid-cols-[240px_1fr] gap-6">
      <aside className="rounded-2xl border bg-card p-3 h-fit md:sticky md:top-28">
        <div className="px-3 py-3 border-b">
          <div className="text-[11px] uppercase tracking-widest text-gold-deep">Customer</div>
          <div className="text-sm font-display truncate">{profile?.full_name || user.email}</div>
          {profile?.customer_code && (
            <div className="mt-1 inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-gold/15 text-gold-deep">
              ID: {profile.customer_code}
            </div>
          )}
        </div>
        <nav className="space-y-1 mt-2">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium ${active ? "bg-ink text-white" : "hover:bg-muted"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
          <button onClick={signOut}
            className="w-full flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </nav>
      </aside>
      <main>
        {pathname === "/account" ? <ProfilePanel /> : <Outlet />}
      </main>
    </div>
  );
}

function ProfilePanel() {
  const { profile, loading, update } = useProfile();
  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
      });
    }
  }, [profile]);

  async function save() {
    setSaving(true);
    const { error } = (await update(form)) ?? {};
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;

  const input = "mt-1 w-full h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold";

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h1 className="font-display text-2xl">Profile</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Saved details auto-fill your next order.
      </p>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Full name</label>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className={input} maxLength={120} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={input} maxLength={30} inputMode="tel" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Default address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={input} maxLength={250} />
        </div>
      </div>
      <button onClick={save} disabled={saving}
        className="mt-5 h-11 px-5 rounded-lg gradient-gold text-ink font-bold inline-flex items-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save changes
      </button>
    </div>
  );
}
