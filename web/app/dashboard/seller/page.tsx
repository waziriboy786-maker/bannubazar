"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Shop { id: string; name: string; status: string; verificationStatus: string; }
interface Product { id: string; name: string; price: string | number; stockQuantity: number; status: string; images: { imageUrl: string }[]; }
interface SellerOrder { id: string; orderStatus: string; total: string | number; customer?: { name: string }; items: { productName: string; quantity: number }[]; }

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [creatingShop, setCreatingShop] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopCity, setShopCity] = useState("Bannu");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "SELLER")) { router.push("/login"); return; }
    if (user) {
      api.get<Product[]>("/products/mine").then(setProducts).catch(() => setProducts([]));
      api.get<SellerOrder[]>("/orders").then(setOrders).catch(() => setOrders([]));
    }
  }, [user, authLoading]);

  const createShop = async () => {
    setCreatingShop(true);
    try {
      const shop = await api.post<Shop>("/shops", { name: shopName, city: shopCity });
      setShops((s) => [...s, shop]);
    } catch (e: any) {
      alert(e.message ?? "Could not create shop. Your seller account may not be verified yet.");
    } finally {
      setCreatingShop(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Seller dashboard</h1>
        <Link href="/dashboard/seller/products/new" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">
          + Add product
        </Link>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="font-semibold text-sm mb-3">Create a shop</h2>
        <p className="text-xs text-gray-500 mb-3">
          Note: your account must be admin-verified before a shop can be created. If this fails, an admin still needs to approve your seller application.
        </p>
        <div className="flex flex-wrap gap-2">
          <input placeholder="Shop name" value={shopName} onChange={(e) => setShopName(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
          <input placeholder="City" value={shopCity} onChange={(e) => setShopCity(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32" />
          <button onClick={createShop} disabled={creatingShop || !shopName}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50">
            Create shop
          </button>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Your products ({products.length})</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-3 flex gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {p.images?.[0] && <img src={p.images[0].imageUrl} className="w-full h-full object-cover" alt="" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-gray-500">Rs {Number(p.price).toLocaleString()} · Stock: {p.stockQuantity}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 inline-block mt-1">{p.status}</span>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-sm text-gray-500">No products yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Recent orders</h2>
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">#{o.id.slice(0, 8)} · {o.customer?.name}</p>
                <p className="text-xs text-gray-500">{o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">Rs {Number(o.total).toLocaleString()}</p>
                <span className="text-xs text-gray-500">{o.orderStatus}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
        </div>
      </section>
    </div>
  );
}
