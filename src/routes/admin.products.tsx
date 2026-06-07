import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Upload, X, Loader2, Star, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const MAX_IMAGES = 5;

interface ProductForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  discount_pct: number;
  images: string[]; // unified gallery: first = main
  category_id: string | null;
  stock: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
}

const empty: ProductForm = {
  name: "", slug: "", description: "", price: 0, compare_at_price: null,
  discount_pct: 0, images: [], category_id: null, stock: 0, sku: "",
  is_active: true, is_featured: false,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductForm | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} total · up to {MAX_IMAGES} images each</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="h-10 px-4 rounded-full gradient-gold text-ink font-semibold inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="mt-6 rounded-2xl border bg-card overflow-hidden">
        {products.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <p>No products yet.</p>
            <p className="text-sm mt-1">Click "Add Product" to create your first one.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3 hidden md:table-cell">Category</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3 hidden sm:table-cell">Stock</th>
                <th className="text-left p-3 hidden md:table-cell">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p: any) => {
                const imgs: string[] = [p.image_url, ...(p.gallery ?? [])].filter(Boolean);
                return (
                  <tr key={p.id}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                          {imgs[0] && <img src={imgs[0]} alt="" className="w-full h-full object-cover" />}
                          {imgs.length > 1 && (
                            <span className="absolute bottom-0 right-0 text-[9px] px-1 bg-black/70 text-white rounded-tl">
                              +{imgs.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-1">
                            {p.name}
                            {p.is_featured && <Star className="h-3 w-3 fill-gold text-gold" />}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{p.category?.name ?? "—"}</td>
                    <td className="p-3 font-semibold">{formatZAR(p.price)}</td>
                    <td className="p-3 hidden sm:table-cell">{p.stock}</td>
                    <td className="p-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {p.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setEditing({
                          id: p.id, name: p.name, slug: p.slug, description: p.description ?? "",
                          price: Number(p.price), compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
                          discount_pct: p.discount_pct ?? 0,
                          images: imgs.slice(0, MAX_IMAGES),
                          category_id: p.category_id,
                          stock: p.stock, sku: p.sku ?? "", is_active: p.is_active, is_featured: p.is_featured,
                        })}
                        className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(p.id)} className="h-8 w-8 inline-flex items-center justify-center rounded text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <ProductEditor
          form={editing}
          categories={categories as any[]}
          onClose={() => setEditing(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            qc.invalidateQueries({ queryKey: ["products"] });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProductEditor({ form: initial, categories, onClose, onSaved }: {
  form: ProductForm; categories: any[]; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductForm>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const available = MAX_IMAGES - form.images.length;
    if (available <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images per product`);
      return;
    }
    const list = Array.from(files).slice(0, available);
    if (files.length > available) {
      toast.message(`Only ${available} image(s) added — limit is ${MAX_IMAGES}.`);
    }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of list) {
        const ext = file.name.split(".").pop();
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("store-media").upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("store-media").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, MAX_IMAGES) }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  }
  function moveImage(i: number, dir: -1 | 1) {
    setForm((f) => {
      const next = [...f.images];
      const j = i + dir;
      if (j < 0 || j >= next.length) return f;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, images: next };
    });
  }
  function makeMain(i: number) {
    if (i === 0) return;
    setForm((f) => {
      const next = [...f.images];
      const [picked] = next.splice(i, 1);
      next.unshift(picked);
      return { ...f, images: next };
    });
  }

  async function save() {
    if (!form.name.trim() || form.price < 0) {
      return toast.error("Name and price required");
    }
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.name);
      const [main, ...rest] = form.images;
      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description || null,
        price: form.price,
        compare_at_price: form.compare_at_price,
        discount_pct: form.discount_pct,
        image_url: main ?? null,
        gallery: rest,
        category_id: form.category_id,
        stock: form.stock,
        sku: form.sku || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };
      const { error } = form.id
        ? await supabase.from("products").update(payload).eq("id", form.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
      toast.success(form.id ? "Product updated" : "Product created");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-lg bg-background shadow-2xl overflow-y-auto">
        <header className="flex items-center justify-between p-5 border-b sticky top-0 bg-background z-10">
          <h2 className="font-display text-xl">{form.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-muted"><X className="h-5 w-5" /></button>
        </header>
        <div className="p-5 space-y-4">
          <Field label="Name *">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} className={input} />
          </Field>
          <Field label="Slug (URL)">
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={input} />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={input} />
          </Field>

          <Field label={`Images (${form.images.length}/${MAX_IMAGES})`}>
            <p className="text-[11px] text-muted-foreground mb-2">First image is the main thumbnail. The rest form the gallery slider.</p>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                {form.images.map((url, i) => (
                  <div key={url + i} className={`relative aspect-square rounded-lg overflow-hidden border ${i === 0 ? "border-gold ring-2 ring-gold/30" : "border-border"}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-gold text-ink font-bold uppercase tracking-wider">Main</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white inline-flex items-center justify-center hover:bg-destructive"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 flex items-stretch text-[10px] bg-black/70 text-white">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="flex-1 py-1 disabled:opacity-40 hover:bg-white/10">◀</button>
                      {i !== 0 && (
                        <button type="button" onClick={() => makeMain(i)} className="flex-1 py-1 border-x border-white/20 hover:bg-white/10">Main</button>
                      )}
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="flex-1 py-1 disabled:opacity-40 hover:bg-white/10">▶</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {form.images.length < MAX_IMAGES && (
              <label className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border cursor-pointer hover:bg-muted text-sm">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload image(s) — up to {MAX_IMAGES - form.images.length} more
                <input
                  type="file" accept="image/*" hidden multiple
                  onChange={(e) => { uploadFiles(e.target.files); e.target.value = ""; }}
                />
              </label>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (R) *">
              <input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={input} />
            </Field>
            <Field label="Compare-at price">
              <input type="number" min={0} step={0.01} value={form.compare_at_price ?? ""} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value ? Number(e.target.value) : null })} className={input} />
            </Field>
            <Field label="Discount %">
              <input type="number" min={0} max={100} value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: Number(e.target.value) })} className={input} />
            </Field>
            <Field label="Stock">
              <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={input} />
            </Field>
            <Field label="SKU">
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={input} />
            </Field>
            <Field label="Category">
              <select value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })} className={input}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active (visible in store)
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              Featured
            </label>
          </div>
          <div className="flex gap-2 pt-3 border-t">
            <button onClick={save} disabled={saving} className="flex-1 h-11 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {form.id ? "Save Changes" : "Create Product"}
            </button>
            <button onClick={onClose} className="h-11 px-5 rounded-lg border">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const input = "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
