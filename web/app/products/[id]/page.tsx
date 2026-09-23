"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface ProductDetail {
  id: string; name: string; description: string; price: number; discountPrice: number | null;
  stockQuantity: number; status: string;
  images: { imageUrl: string }[];
  shop: { id: string; name: string; city: string | null; area: string | null };
  category: { name: string };
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.get<ProductDetail>(`/products/${id}`).then(setProduct).catch(() => setProduct(null));
  }, [id]);

  const addToCart = async () => {
    if (!user) { router.push("/login"); return; }
    if (user.role !== "CUSTOMER") { setMessage("Only customer accounts can add items to cart."); return; }
    try {
      await api.post("/cart/items", { productId: id, quantity: qty });
      setMessage("Added to cart.");
    } catch (e) {
      setMessage(e instanceof ApiRequestError ? e.message : "Could not add to cart.");
    }
  };

  if (!product) return <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-gray-500">Loading…</div>;

  const price = product.discountPrice ?? product.price;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 pb-20 md:pb-8">
      <div>
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 mt-2">
            {product.images.slice(1, 5).map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img.imageUrl} className="w-16 h-16 object-cover rounded-lg border" alt="" />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-brand-600 font-medium">{product.category?.name}</p>
        <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
        <Link href={`/shops/${product.shop.id}`} className="text-sm text-gray-500 hover:text-brand-600 mt-1 inline-block">
          Sold by {product.shop.name}{product.shop.city ? ` · ${product.shop.city}` : ""}
        </Link>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-brand-700">Rs {price.toLocaleString()}</span>
          {product.discountPrice && <span className="text-gray-400 line-through">Rs {product.price.toLocaleString()}</span>}
        </div>

        <p className={`mt-2 text-sm ${product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}`}>
          {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <input type="number" min={1} max={product.stockQuantity} value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button onClick={addToCart} disabled={product.stockQuantity === 0}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50">
            Add to cart
          </button>
        </div>
        {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}

        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-sm mb-2">Description</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
