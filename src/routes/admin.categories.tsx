import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function AdminCategories() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: cats = [] } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("categories").insert({
      name: name.trim(), slug: slugify(name), sort_order: cats.length + 1,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    setName("");
    toast.success("Category added");
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function toggle(id: string, val: boolean) {
    await supabase.from("categories").update({ is_active: val }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Products will keep their data but lose the link.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Categories</h1>
      <p className="text-sm text-muted-foreground mt-1">Organize your product catalog.</p>

      <div className="mt-6 rounded-2xl border bg-card p-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold"
        />
        <button onClick={add} disabled={saving} className="h-10 px-4 rounded-lg gradient-gold text-ink font-semibold inline-flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </button>
      </div>

      <div className="mt-4 rounded-2xl border bg-card divide-y">
        {(cats as any[]).map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">/{c.slug}</div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs inline-flex items-center gap-1">
                <input type="checkbox" checked={c.is_active} onChange={(e) => toggle(c.id, e.target.checked)} />
                Active
              </label>
              <button onClick={() => remove(c.id)} className="h-8 w-8 inline-flex items-center justify-center rounded text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
