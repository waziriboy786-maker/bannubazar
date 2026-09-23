"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface CartItem { id: string; productId: string; quantity: number; price: string | number; product: { name: string; shopId: string }; }
interface CartData { items: CartItem[]; }

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const shopId = params.get("shopId") ?? "";

  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState({ recipientName: "", phone: "", address: "", area: "", city: "Bannu" });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) {
      api.get<CartData>("/cart").then((cart) => {
        setItems(cart.items.filter((i) => i.product.shopId === shopId));
      });
    }
  }, [user, authLoading, shopId]);

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const deliveryFee = 150; // must match server default — server recalculates authoritatively regardless
  const total = subtotal + deliveryFee;

  const placeOrder = async () => {
    setError(null);
    if (!address.recipientName || !address.phone || !address.address) {
      setError("Please fill in your delivery details.");
      return;
    }
    setPlacing(true);
    try {
      const order = await api.post<{ id: string }>("/orders", {
        shopId,
        paymentMethod: "COD",
        deliveryAddress: address,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      router.push(`/orders?placed=${order.id}`);
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Could not place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-xl font-bold mb-6">Checkout</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">Delivery address</h2>
        <input placeholder="Recipient name" value={address.recipientName}
          onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Phone number" value={address.phone}
          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="House / street address" value={address.address}
          onChange={(e) => setAddress({ ...address, address: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Area" value={address.area}
            onChange={(e) => setAddress({ ...address, area: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="City" value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
        <h2 className="font-semibold text-sm mb-2">Order summary</h2>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm py-1">
            <span>{i.product.name} × {i.quantity}</span>
            <span>Rs {(Number(i.price) * i.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 mt-2 pt-2 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>Rs {subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Delivery fee</span><span>Rs {deliveryFee.toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold text-base"><span>Total</span><span>Rs {total.toLocaleString()}</span></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Payment method: Cash on Delivery. Final total is confirmed by the server.</p>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      <button onClick={placeOrder} disabled={placing || items.length === 0}
        className="w-full mt-4 bg-brand-600 text-white rounded-lg py-3 font-medium hover:bg-brand-700 disabled:opacity-60">
        {placing ? "Placing order…" : "Place order (Cash on Delivery)"}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
