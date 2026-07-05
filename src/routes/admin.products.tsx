import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Pencil, Plus, Star, Trash2, Upload, X } from "lucide-react";
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
  brand: string;
  price: number;
  compare_at_price: number | null;
  discount_pct: number;
  images: string[];
  category_id: string | null;
  colours: string[];
  sizes: string[];
  specifications: string;
  delivery_info: string;
  stock: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
}

const empty: ProductForm = {
  name: "",
  slug: "",
  description: "",
  brand: "",
  price: 0,
  compare_at_price: null,
  discount_pct: 0,
  images: [],
  category_id: null,
  colours: [],
  sizes: [],
  specifications: "",
  delivery_info: "",
  stock: 0,
  sku: "",
  is_active: true,
  is_featured: false,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizeJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function specsToText(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const label = String(record.label ?? record.name ?? record.key ?? "").trim();
          const detail = String(record.value ?? record.detail ?? record.text ?? "").trim();
          return [label, detail].filter(Boolean).join(": ");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (typeof value === "string") return value;
  return "";
}

function textToSpecs(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      const detail = rest.join(":").trim();
      return detail ? { label: label.trim(), value: detail } : { value: label.trim() };
    });
}

function productImages(product: any): string[] {
  return [product.image_url, ...(Array.isArray(product.gallery) ? product.gallery : [])].filter(Boolean);
}

function productToForm(product: any): ProductForm {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    brand: product.brand ?? "",
    price: Number(product.price),
    compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
    discount_pct: product.discount_pct ?? 0,
    images: productImages(product).slice(0, MAX_IMAGES),
    category_id: product.category_id,
    colours: normalizeJsonArray(product.colours),
    sizes: normalizeJsonArray(product.sizes),
    specifications: specsToText(product.specifications),
    delivery_info: product.delivery_info ?? "",
    stock: product.stock,
    sku: product.sku ?? "",
    is_active: product.is_active,
    is_featured: product.is_featured,
  };
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} total · up to {MAX_IMAGES} images each</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="h-10 px-4 rounded-full gradient-gold text-ink font-semibold inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="mt-6 rounded-2xl border bg-card overflow-hidden">
        {products.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <p>No products yet.</p>
            <p className="text-sm mt-1">Click “Add Product” to create your first one.</p>
          </div>
        ) : (
          <>
            <div className="divide-y sm:hidden">
              {products.map((product: any) => {
                const imgs = productImages(product);
                return (
                  <div key={product.id} className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                        {imgs[0] && <img src={imgs[0]} alt={product.name} className="w-full h-full object-cover" />}
                        {imgs.length > 1 && (
                          <span className="absolute bottom-0 right-0 text-[9px] px-1 bg-foreground/80 text-background rounded-tl">
                            +{imgs.length - 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold leading-snug flex items-center gap-1">
                          <span className="truncate">{product.name}</span>
                          {product.is_featured && <Star className="h-3 w-3 fill-gold text-gold shrink-0" />}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{product.category?.name ?? "No category"} · Stock {product.stock}</div>
                        <div className="mt-1 font-bold">{formatZAR(product.price)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setEditing(productToForm(product))}
                        className="h-10 rounded-lg border border-gold/50 bg-gold/10 font-semibold inline-flex items-center justify-center gap-2"
                      >
                        <Pencil className="h-4 w-4" /> Edit Product
                      </button>
                      <button onClick={() => remove(product.id)} className="h-10 rounded-lg border border-destructive/40 text-destructive font-semibold inline-flex items-center justify-center gap-2">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Product</th>
                    <th className="text-left p-3 hidden md:table-cell">Category</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Stock</th>
                    <th className="text-left p-3 hidden md:table-cell">Status</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product: any) => {
                    const imgs = productImages(product);
                    return (
                      <tr key={product.id}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                              {imgs[0] && <img src={imgs[0]} alt={product.name} className="w-full h-full object-cover" />}
                              {imgs.length > 1 && (
                                <span className="absolute bottom-0 right-0 text-[9px] px-1 bg-foreground/80 text-background rounded-tl">
                                  +{imgs.length - 1}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate flex items-center gap-1">
                                {product.name}
                                {product.is_featured && <Star className="h-3 w-3 fill-gold text-gold" />}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">{product.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{product.category?.name ?? "—"}</td>
                        <td className="p-3 font-semibold">{formatZAR(product.price)}</td>
                        <td className="p-3">{product.stock}</td>
                        <td className="p-3 hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${product.is_active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {product.is_active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setEditing(productToForm(product))}
                            className="h-9 px-3 inline-flex items-center justify-center gap-2 rounded-lg border border-gold/50 bg-gold/10 font-semibold hover:bg-gold/20"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button onClick={() => remove(product.id)} className="ml-1 h-9 w-9 inline-flex items-center justify-center rounded-lg text-destructive hover:bg-destructive/10" aria-label={`Delete ${product.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
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

  async function uploadOne(file: File) {
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("store-media").upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("store-media").getPublicUrl(path);
    return data.publicUrl;
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const available = MAX_IMAGES - form.images.length;
    if (available <= 0) return toast.error(`Maximum ${MAX_IMAGES} images per product`);
    const list = Array.from(files).slice(0, available);
    if (files.length > available) toast.message(`Only ${available} image(s) added — limit is ${MAX_IMAGES}.`);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of list) urls.push(await uploadOne(file));
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, MAX_IMAGES) }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function replaceImage(index: number, file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadOne(file);
      setForm((f) => ({ ...f, images: f.images.map((img, i) => (i === index ? url : img)) }));
      toast.success("Image replaced");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Replace failed");
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
    if (!form.name.trim() || form.price < 0) return toast.error("Name and price required");
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.name);
      const [main, ...rest] = form.images;
      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description || null,
        brand: form.brand.trim() || null,
        price: form.price,
        compare_at_price: form.compare_at_price,
        discount_pct: form.discount_pct,
        image_url: main ?? null,
        gallery: rest,
        category_id: form.category_id,
        colours: form.colours,
        sizes: form.sizes,
        specifications: textToSpecs(form.specifications),
        delivery_info: form.delivery_info.trim() || null,
        stock: form.stock,
        sku: form.sku || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };
      if (form.id) {
        const { data, error } = await supabase.from("products").update(payload).eq("id", form.id).select("id");
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Update blocked — you may not have admin permissions. Try signing out and back in.");
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product created");
      }
      onSaved();
    } catch (e: unknown) {
      const err = e as { message?: string; details?: string };
      console.error("Product save failed:", err);
      toast.error(err.message || err.details || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct() {
    if (!form.id) return;
    if (!confirm(`Delete “${form.name}”? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", form.id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:max-w-2xl bg-background shadow-2xl overflow-y-auto">
        <header className="flex items-center justify-between p-5 border-b sticky top-0 bg-background z-10">
          <h2 className="font-display text-xl">{form.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-muted" aria-label="Close product editor"><X className="h-5 w-5" /></button>
        </header>
        <div className="p-5 space-y-4">
          <Field label="Name *">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} className={input} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Slug (URL)">
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={input} />
            </Field>
            <Field label="Brand">
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={input} />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className={textarea} />
          </Field>

          <Field label={`Images (${form.images.length}/${MAX_IMAGES})`}>
            <p className="text-[11px] text-muted-foreground mb-2">First image is the main thumbnail. Use Replace, Delete, arrows, and Main to manage the gallery.</p>
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                {form.images.map((url, i) => (
                  <div key={url + i} className={`relative aspect-square rounded-lg overflow-hidden border ${i === 0 ? "border-gold ring-2 ring-gold/30" : "border-border"}`}>
                    <img src={url} alt={`${form.name || "Product"} image ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-gold text-ink font-bold uppercase tracking-wider">Main</span>}
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-foreground/80 text-background inline-flex items-center justify-center hover:bg-destructive" aria-label="Remove image">
                      <X className="h-3 w-3" />
                    </button>
                    <label className="absolute left-1 bottom-8 right-1 h-6 rounded bg-background/90 text-[10px] font-semibold inline-flex items-center justify-center cursor-pointer hover:bg-background">
                      Replace
                      <input type="file" accept="image/*" hidden onChange={(e) => { replaceImage(i, e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                    <div className="absolute bottom-0 inset-x-0 flex items-stretch text-[10px] bg-foreground/80 text-background">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="flex-1 py-1 disabled:opacity-40 hover:bg-background/10" aria-label="Move image left"><ArrowLeft className="mx-auto h-3 w-3" /></button>
                      {i !== 0 && <button type="button" onClick={() => makeMain(i)} className="flex-1 py-1 border-x border-background/20 hover:bg-background/10">Main</button>}
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="flex-1 py-1 disabled:opacity-40 hover:bg-background/10" aria-label="Move image right"><ArrowRight className="mx-auto h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {form.images.length < MAX_IMAGES && (
              <label className="inline-flex items-center gap-2 min-h-10 px-3 py-2 rounded-lg border cursor-pointer hover:bg-muted text-sm">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload image(s) — up to {MAX_IMAGES - form.images.length} more
                <input type="file" accept="image/*" hidden multiple onChange={(e) => { uploadFiles(e.target.files); e.target.value = ""; }} />
              </label>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (R) *">
              <input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={input} />
            </Field>
            <Field label="Sale Price">
              <input type="number" min={0} step={0.01} value={form.compare_at_price ?? ""} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value ? Number(e.target.value) : null })} className={input} />
            </Field>
            <Field label="Discount %">
              <input type="number" min={0} max={100} value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: Number(e.target.value) })} className={input} />
            </Field>
            <Field label="Stock Quantity">
              <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={input} />
            </Field>
            <Field label="SKU">
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={input} />
            </Field>
            <Field label="Category">
              <select value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })} className={input}>
                <option value="">— None —</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TagField label="Colours" value={form.colours} placeholder="Black, White, Gold" onChange={(colours) => setForm({ ...form, colours })} />
            <TagField label="Sizes" value={form.sizes} placeholder="S, M, L or 32, 34, 36" onChange={(sizes) => setForm({ ...form, sizes })} />
          </div>
          <Field label="Specifications">
            <textarea value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} rows={4} placeholder="Material: Cotton\nWarranty: 6 months" className={textarea} />
          </Field>
          <Field label="Delivery Information">
            <textarea value={form.delivery_info} onChange={(e) => setForm({ ...form, delivery_info: e.target.value })} rows={3} placeholder="Delivery time, handling notes, collection rules" className={textarea} />
          </Field>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active (visible in store)
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
              Featured Product
            </label>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            <button onClick={save} disabled={saving || uploading} className="flex-1 min-w-[180px] h-11 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {form.id ? "Save Changes" : "Create Product"}
            </button>
            {form.id && <button onClick={deleteProduct} className="h-11 px-4 rounded-lg border border-destructive/40 text-destructive text-sm font-semibold">Delete</button>}
            <button onClick={onClose} className="h-11 px-5 rounded-lg border">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const input = "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold";
const textarea = "w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-gold";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function TagField({ label, value, placeholder, onChange }: { label: string; value: string[]; placeholder: string; onChange: (value: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function addTags(raw: string) {
    const next = raw.split(",").map((item) => item.trim()).filter(Boolean);
    if (next.length === 0) return;
    onChange(Array.from(new Set([...value, ...next])));
    setDraft("");
  }

  return (
    <Field label={label}>
      <div className="space-y-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-1 text-xs">
                {item}
                <button type="button" onClick={() => onChange(value.filter((v) => v !== item))} aria-label={`Remove ${item}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => addTags(draft)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTags(draft);
            }
          }}
          className={input}
        />
      </div>
    </Field>
  );
}
