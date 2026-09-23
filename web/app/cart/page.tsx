"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface CartItem {
  id: string; productId: string; quantity: number; price: string | number;
  product: { name: string; images: { imageUrl: string }[]; shopId: string; stockQuantity: number };
}
interface CartData { id: string; items: CartItem[]; }

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);

  const load = () => api.get<CartData>("/cart").then(setCart).catch(() => setCart(null));

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) load();
  }, [user, authLoading]);

  const updateQty = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    await api.patch(`/cart/items/${itemId}`, { quantity });
    load();
  };
  const removeItem = async (itemId: string) => {
    await api.delete(`/cart/items/${itemId}`);
    load();
  };

  if (!cart) return <div className="max-w-4xl mx-auto px-4 py-10 text-sm text-gray-500">Loading cart…</div>;

  const total = cart.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  // Group by shop — checkout is single-shop at a time in this MVP.
  const byShop = cart.items.reduce<Record<string, CartItem[]>>((acc, item) => {
    (acc[item.product.shopId] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-xl font-bold mb-6">Your cart</h1>
      {cart.items.length === 0 ? (
        <p className="text-sm text-gray-500">Your cart is empty. <Link href="/search" className="text-brand-600 hover:underline">Browse products</Link></p>
      ) : (
        <div className="space-y-8">
          {Object.entries(byShop).map(([shopId, items]) => {
            const shopTotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
            return (
              <div key={shopId} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.product.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-sm text-brand-700">Rs {Number(item.price).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 border rounded">-</button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 border rounded">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 hover:underline ml-2">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Subtotal: Rs {shopTotal.toLocaleString()}</span>
                  <Link href={`/checkout?shopId=${shopId}`} className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">
                    Checkout this shop
                  </Link>
                </div>
              </div>
            );
          })}
          <p className="text-sm text-gray-500">Cart total across all shops: Rs {total.toLocaleString()} (checkout is done per-shop)</p>
        </div>
      )}
    </div>
  );
}
