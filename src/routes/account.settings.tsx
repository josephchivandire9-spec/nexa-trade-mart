import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/account/settings")({
  head: () => ({ meta: [{ title: "Settings — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [pw, setPw] = useState("");
  const [saving, setSaving] = useState(false);

  async function changePassword() {
    if (pw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setPw(""); }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-5">
      <div>
        <h1 className="font-display text-2xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage account security.</p>
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <Lock className="h-3.5 w-3.5" /> Change password
        </label>
        <div className="mt-1 flex gap-2">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            placeholder="New password (min 6 chars)" minLength={6}
            className="flex-1 h-11 rounded-lg border bg-background px-3 text-sm" />
          <button onClick={changePassword} disabled={saving}
            className="h-11 px-5 rounded-lg gradient-gold text-ink font-bold inline-flex items-center gap-2 text-sm">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Update
          </button>
        </div>
      </div>
    </div>
  );
}
