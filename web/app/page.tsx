"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard, { ProductCardData } from "@/components/ProductCard";

interface Category { id: string; name: string; }

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          api.get<Category[]>("/categories"),
          api.get<ProductCardData[]>("/products?sort=newest&limit=12"),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch {
        // API may not be running yet during local setup — fail quietly on the homepage.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10 pb-20 md:pb-6">
      {/* Hero */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-8 md:p-12 text-white">
        <h1 className="text-2xl md:text-4xl font-bold max-w-2xl">
          Shop local in Bannu — from verified shopkeepers near you.
        </h1>
        <p className="mt-3 text-brand-50 max-w-xl">
          Browse products, chat with sellers, and get it delivered across the city.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/search" className="bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-full hover:bg-brand-50">
            Browse products
          </Link>
          <Link href="/register?role=SELLER" className="border border-white/70 text-white font-semibold px-5 py-2.5 rounded-full hover:bg-white/10">
            Become a seller
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Shop by category</h2>
        {categories.length > 0 ? <CategoryGrid categories={categories} /> : <p className="text-sm text-gray-500">Loading categories…</p>}
      </section>

      {/* New products */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">New arrivals</h2>
          <Link href="/search?sort=newest" className="text-sm text-brand-600 hover:underline">See all</Link>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading products…</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No products yet. Run the seed script or approve a seller and add products to see them here.
          </p>
        )}
      </section>

      {/* Become a partner banners */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Sell on BannuBazaar</h3>
          <p className="text-sm text-gray-600 mt-1">Reach customers across Bannu with your own shop page.</p>
          <Link href="/register?role=SELLER" className="inline-block mt-3 text-sm font-medium text-brand-600 hover:underline">
            Create your shop →
          </Link>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Deliver for BannuBazaar</h3>
          <p className="text-sm text-gray-600 mt-1">Earn by delivering orders around the city, on your schedule.</p>
          <Link href="/register?role=DELIVERY_PARTNER" className="inline-block mt-3 text-sm font-medium text-brand-600 hover:underline">
            Apply as a rider →
          </Link>
        </div>
      </section>
    </div>
  );
}
