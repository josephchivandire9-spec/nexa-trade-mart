import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, User, Package, LogOut, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — NEXA TRADE MART" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

function AccountLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
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

  const isOrders = pathname.startsWith("/account/orders");

  return (
    <div className="container-px mx-auto max-w-5xl py-10 grid md:grid-cols-[220px_1fr] gap-6">
      <aside className="rounded-2xl border bg-card p-3 h-fit">
        <div className="px-3 py-2">
          <div className="text-[11px] uppercase tracking-widest text-gold-deep">My Account</div>
          <div className="text-sm font-display truncate">{user.email}</div>
        </div>
        <nav className="space-y-1">
          <Link
            to="/account"
            className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium ${!isOrders ? "bg-ink text-white" : "hover:bg-muted"}`}
          >
            <User className="h-4 w-4" /> Profile
          </Link>
          <Link
            to="/account/orders"
            className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium ${isOrders ? "bg-ink text-white" : "hover:bg-muted"}`}
          >
            <Package className="h-4 w-4" /> Order History
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-destructive hover:bg-destructive/10"
          >
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
        Saved details are used to auto-fill your next order.
      </p>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Full name</label>
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className={input}
            maxLength={120}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={input}
            maxLength={30}
            inputMode="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Address</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={input}
            maxLength={250}
          />
        </div>
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-5 h-11 px-5 rounded-lg gradient-gold text-ink font-bold inline-flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save changes
      </button>
    </div>
  );
}
