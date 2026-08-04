import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { removeStorageObjects, storageUrl, uploadImage, UPLOAD_ACCEPT_ATTR } from "@/lib/storage";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

function AdminBanners() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", subtitle: "", cta_text: "", cta_link: "", image_url: "" as string | null });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: banners = [] } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => (await supabase.from("banners").select("*").order("sort_order")).data ?? [],
  });

  async function upload(file: File) {
    setUploading(true);
    try {
      const path = await uploadImage(file, "banners");
      setForm((f) => ({ ...f, image_url: path }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function add() {
    if (!form.title.trim()) return toast.error("Title required");
    setSaving(true);
    const { error } = await supabase.from("banners").insert({ ...form, sort_order: banners.length + 1 });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Banner added");
    setForm({ title: "", subtitle: "", cta_text: "", cta_link: "", image_url: null });
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete banner?")) return;
    const banner = (banners as any[]).find((b) => b.id === id);
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await removeStorageObjects([banner?.image_url]);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  const input = "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold";

  return (
    <div>
      <h1 className="font-display text-3xl">Homepage Banners</h1>
      <p className="text-sm text-muted-foreground mt-1">Promotional banners displayed on your storefront.</p>

      <div className="mt-6 rounded-2xl border bg-card p-5 space-y-3">
        <h2 className="font-semibold">New Banner</h2>
        <input placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={input} />
        <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={input} />
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="CTA Text" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className={input} />
          <input placeholder="CTA Link (/shop)" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} className={input} />
        </div>
        {form.image_url && <img src={storageUrl(form.image_url)} alt="" className="h-32 rounded-lg object-cover" />}
        <label className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border cursor-pointer text-sm">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload image
          <input type="file" accept={UPLOAD_ACCEPT_ATTR} hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        <button onClick={add} disabled={saving} className="h-10 px-4 rounded-lg gradient-gold text-ink font-semibold inline-flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Banner
        </button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {(banners as any[]).map((b) => (
          <div key={b.id} className="rounded-2xl border bg-card overflow-hidden">
            {b.image_url && <img src={storageUrl(b.image_url)} alt={b.title} loading="lazy" className="w-full h-32 object-cover" />}
            <div className="p-4">
              <div className="font-medium">{b.title}</div>
              {b.subtitle && <div className="text-xs text-muted-foreground">{b.subtitle}</div>}
              <button onClick={() => remove(b.id)} className="mt-3 h-8 px-3 rounded-lg text-destructive border border-destructive/30 text-xs inline-flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
