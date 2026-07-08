import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Pencil, User, Phone, Mail, MapPin, BadgeCheck, Sparkles, Copy, X, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRewards } from "@/hooks/useRewards";
import { PhoneInput } from "@/components/PhoneInput";
import { toast } from "sonner";

export const Route = createFileRoute("/account/profile")({
  head: () => ({ meta: [{ title: "Profile — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, update } = useProfile();
  const { approved: points } = useRewards();
  const [editing, setEditing] = useState(false);

  if (loading) return <Loader2 className="h-5 w-5 animate-spin" />;

  const initials = (profile?.full_name || user?.email || "?")
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full gradient-gold text-ink font-bold inline-flex items-center justify-center text-xl shrink-0 shadow-gold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-widest text-gold-deep">My Profile</div>
            <h1 className="font-display text-2xl truncate">{profile?.full_name || "Add your name"}</h1>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
          <button onClick={() => setEditing(true)}
            className="h-10 px-4 rounded-lg gradient-gold text-ink font-bold inline-flex items-center gap-2 text-sm shrink-0">
            <Pencil className="h-4 w-4" /> <span className="hidden sm:inline">Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <h2 className="font-display text-lg mb-4">Personal Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field icon={User} label="Full Name" value={profile?.full_name} />
          <Field icon={Mail} label="Email Address" value={user?.email} />
          <Field icon={Phone} label="Phone Number" value={profile?.phone} />
          <Field icon={MapPin} label="Default Address" value={profile?.address} full />
        </div>
      </div>

      {/* Membership + Referral */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-6 shadow-premium">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gold-deep">
            <BadgeCheck className="h-4 w-4" /> Membership Status
          </div>
          <div className="font-display text-2xl mt-1">
            {points >= 1500 ? "Platinum" : points >= 500 ? "Gold" : points >= 200 ? "Silver" : "Bronze"} Member
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold-deep" /> {points} points
          </div>
        </div>
        <ReferralCard code={profile?.referral_code} />
      </div>

      {editing && (
        <EditProfileModal
          initial={{ full_name: profile?.full_name ?? "", phone: profile?.phone ?? "", address: profile?.address ?? "" }}
          onClose={() => setEditing(false)}
          onSave={async (patch) => {
            const res: any = (await update(patch)) ?? {};
            if (res.error) { toast.error(res.error.message); return false; }
            return true;
          }}
        />
      )}
    </div>
  );
}

function Field({ icon: Icon, label, value, full }: { icon: typeof User; label: string; value?: string | null; full?: boolean }) {
  return (
    <div className={`rounded-xl border bg-background p-4 ${full ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className={`mt-1 text-sm ${value ? "font-medium" : "text-muted-foreground italic"}`}>
        {value || "Not set"}
      </div>
    </div>
  );
}

function ReferralCard({ code }: { code?: string | null }) {
  return (
    <div className="rounded-2xl border p-6 bg-gold/10 border-gold/40 shadow-premium">
      <div className="text-[11px] uppercase tracking-widest text-gold-deep">Referral Code</div>
      <div className="font-display text-2xl mt-1 text-gold-deep">{code || "—"}</div>
      {code && (
        <button onClick={() => { navigator.clipboard?.writeText(code); toast.success("Code copied"); }}
          className="mt-3 h-9 px-3 rounded-lg border border-gold/50 bg-background text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-gold/10">
          <Copy className="h-3.5 w-3.5" /> Copy code
        </button>
      )}
    </div>
  );
}

function EditProfileModal({
  initial, onClose, onSave,
}: {
  initial: { full_name: string; phone: string; address: string };
  onClose: () => void;
  onSave: (patch: { full_name: string; phone: string; address: string }) => Promise<boolean>;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) {
      setDone(true);
      toast.success("Profile updated successfully");
      setTimeout(onClose, 1400);
    }
  }

  const input = "mt-1 w-full h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}>
      <div className="bg-background w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border shadow-premium animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-display text-lg">Edit Profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center animate-in zoom-in duration-300">
              <BadgeCheck className="h-7 w-7" />
            </div>
            <p className="mt-3 font-display text-lg">Profile updated successfully</p>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Full name</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={input} maxLength={120} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone</label>
                <div className="mt-1"><PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Default address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={input} maxLength={250} />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t">
              <button onClick={onClose} className="flex-1 h-11 rounded-lg border font-semibold text-sm">Cancel</button>
              <button onClick={submit} disabled={saving}
                className="flex-1 h-11 rounded-lg gradient-gold text-ink font-bold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
