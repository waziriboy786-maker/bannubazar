"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ProductCard, { ProductCardData } from "@/components/ProductCard";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "newest");

  const q = params.get("q") ?? "";
  const categoryId = params.get("categoryId") ?? "";

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (categoryId) qs.set("categoryId", categoryId);
    if (minPrice) qs.set("minPrice", minPrice);
    if (maxPrice) qs.set("maxPrice", maxPrice);
    if (sort) qs.set("sort", sort);
    qs.set("limit", "24");

    api.get<ProductCardData[]>(`/products?${qs.toString()}`)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, categoryId, minPrice, maxPrice, sort]);

  const applyFilters = () => {
    const qs = new URLSearchParams(Array.from(params.entries()));
    if (minPrice) qs.set("minPrice", minPrice); else qs.delete("minPrice");
    if (maxPrice) qs.set("maxPrice", maxPrice); else qs.delete("maxPrice");
    qs.set("sort", sort);
    router.push(`/search?${qs.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-4 gap-6 pb-20 md:pb-6">
      <aside className="md:col-span-1 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3">Filters</h3>
          <div className="space-y-2">
            <label className="text-xs text-gray-600">Min price</label>
            <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <label className="text-xs text-gray-600">Max price</label>
            <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            <label className="text-xs text-gray-600">Sort by</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
            <button onClick={applyFilters} className="w-full mt-2 bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700">
              Apply
            </button>
          </div>
        </div>
      </aside>

      <section className="md:col-span-3">
        <h1 className="text-lg font-semibold mb-4">
          {q ? `Results for "${q}"` : "Browse products"}
        </h1>
        {loading ? (
          <p className="text-sm text-gray-500">Searching…</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No products found. Try different filters.</p>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
