import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/social")({
  component: AdminSocialPage,
});

const PLATFORMS = ["facebook", "instagram", "tiktok", "youtube", "x", "twitter", "linkedin", "telegram", "pinterest", "whatsapp", "custom"];

type Row = {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
  is_enabled: boolean;
};

function AdminSocialPage() {
  const { data = [] } = useSocialLinks(true);
  const qc = useQueryClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setRows(data as Row[]); }, [data]);

  function update(i: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function addRow() {
    setRows((r) => [...r, {
      id: crypto.randomUUID(), platform: "facebook", label: "Facebook",
      url: "https://", icon: "facebook", sort_order: r.length, is_enabled: true,
    }]);
  }
  async function removeRow(row: Row) {
    if (data.find((d) => d.id === row.id)) {
      if (!confirm(`Remove ${row.label}?`)) return;
      const { error } = await supabase.from("social_links").delete().eq("id", row.id);
      if (error) return toast.error(error.message);
    }
    setRows((r) => r.filter((x) => x.id !== row.id));
    qc.invalidateQueries({ queryKey: ["social-links"] });
  }
  async function saveAll() {
    setSaving(true);
    try {
      const payload = rows.map((r, idx) => ({
        id: r.id, platform: r.platform, label: r.label.trim() || r.platform,
        url: r.url.trim(), icon: r.icon || r.platform, sort_order: idx, is_enabled: r.is_enabled,
      })).filter((r) => r.url);
      const { error } = await supabase.from("social_links").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["social-links"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl">Social Media</h1>
          <p className="text-sm text-muted-foreground">Manage links shown in the footer. Customers only see enabled platforms.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addRow} className="h-10 px-3 rounded-lg border inline-flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add platform
          </button>
          <button onClick={saveAll} disabled={saving} className="h-10 px-4 rounded-lg gradient-gold text-ink font-bold inline-flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card divide-y">
        {rows.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground text-center">No social links yet. Click "Add platform".</p>
        )}
        {rows.map((r, i) => (
          <div key={r.id} className="p-3 grid gap-2 md:grid-cols-[auto,1fr,1fr,1fr,auto,auto] items-center">
            <GripVertical className="h-4 w-4 text-muted-foreground hidden md:block" />
            <select
              value={r.platform}
              onChange={(e) => update(i, { platform: e.target.value, icon: e.target.value, label: r.label || e.target.value })}
              className="h-10 rounded-lg border bg-background px-2 text-sm capitalize"
            >
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input
              value={r.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label"
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            />
            <input
              value={r.url}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder="https://..."
              className="h-10 rounded-lg border bg-background px-3 text-sm md:col-span-1"
            />
            <label className="inline-flex items-center gap-2 text-xs">
              <input type="checkbox" checked={r.is_enabled} onChange={(e) => update(i, { is_enabled: e.target.checked })} />
              Enabled
            </label>
            <button onClick={() => removeRow(r)} className="h-10 w-10 rounded-lg border text-destructive inline-flex items-center justify-center">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
