"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Shop { id: string; name: string; }
interface Category { id: string; name: string; }

export default function NewProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    shopId: "", categoryId: "", name: "", description: "", price: "", stockQuantity: "", sku: "", brand: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "SELLER")) { router.push("/login"); return; }
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
    // Sellers only see their own shops via /shops?... in a full build; MVP: fetch by listing all active + filter client-side is not ideal,
    // so in production add a GET /shops/mine endpoint. For now sellers paste their shop id if needed.
  }, [user, authLoading]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let images: string[] = [];
      if (imageFile) {
        setUploading(true);
        const { url } = await api.uploadImage(imageFile);
        images = [url];
        setUploading(false);
      }
      await api.post("/products", {
        shopId: form.shopId,
        categoryId: form.categoryId,
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        sku: form.sku || undefined,
        brand: form.brand || undefined,
        images,
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/seller"), 1000);
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Could not create product.");
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-xl font-bold mb-6">Add a product</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Shop ID</label>
          <input value={form.shopId} onChange={(e) => setForm({ ...form, shopId: e.target.value })} required
            placeholder="Create a shop first, then paste its id here"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Product name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Price (Rs)</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Stock quantity</label>
            <input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Product image</label>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Product submitted for admin review.</p>}
        <button disabled={uploading} className="w-full bg-brand-600 text-white rounded-lg py-2.5 font-medium hover:bg-brand-700 disabled:opacity-60">
          {uploading ? "Uploading image…" : "Submit product"}
        </button>
        <p className="text-xs text-gray-500">New products start as PENDING and go live after admin approval.</p>
      </form>
    </div>
  );
}
