"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import ProductCard, { ProductCardData } from "@/components/ProductCard";

interface ShopDetail {
  id: string; name: string; description: string | null; city: string | null; area: string | null;
  logo: string | null; coverImage: string | null; openingTime: string | null; closingTime: string | null;
}

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    api.get<ShopDetail>(`/shops/${id}`).then(setShop).catch(() => setShop(null));
    api.get<ProductCardData[]>(`/products?shopId=${id}&limit=24`).then(setProducts).catch(() => setProducts([]));
  }, [id]);

  if (!shop) return <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="pb-20 md:pb-8">
      <div className="h-40 md:h-56 bg-gray-200">
        {shop.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shop.coverImage} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <div className="-mt-10 flex items-end gap-4">
          <div className="w-20 h-20 rounded-xl bg-white border-4 border-white shadow overflow-hidden">
            {shop.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shop.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl">
                {shop.name[0]}
              </div>
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-xl font-bold">{shop.name}</h1>
            <p className="text-sm text-gray-500">{[shop.area, shop.city].filter(Boolean).join(", ")}</p>
          </div>
        </div>

        {shop.description && <p className="mt-4 text-sm text-gray-700 max-w-2xl">{shop.description}</p>}
        {(shop.openingTime || shop.closingTime) && (
          <p className="mt-1 text-xs text-gray-500">Open {shop.openingTime ?? "?"} – {shop.closingTime ?? "?"}</p>
        )}

        <h2 className="mt-8 mb-3 font-semibold">Products from this shop</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-sm text-gray-500">This shop hasn't listed any products yet.</p>
        )}
      </div>
    </div>
  );
}
