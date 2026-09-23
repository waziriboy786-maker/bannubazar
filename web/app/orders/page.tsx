"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface OrderItem { id: string; productName: string; quantity: number; price: string | number; }
interface Order {
  id: string; orderStatus: string; paymentStatus: string; total: string | number; createdAt: string;
  items: OrderItem[]; shop?: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800", CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-blue-100 text-blue-800", PACKED: "bg-blue-100 text-blue-800",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800", DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800", FAILED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) api.get<Order[]>("/orders").then(setOrders).catch(() => setOrders([]));
  }, [user, authLoading]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-xl font-bold mb-6">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{o.shop?.name ?? "Order"} · #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[o.orderStatus] ?? "bg-gray-100 text-gray-700"}`}>
                  {o.orderStatus.replaceAll("_", " ")}
                </span>
              </div>
              <div className="mt-3 space-y-1">
                {o.items.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm text-gray-700">
                    <span>{i.productName} × {i.quantity}</span>
                    <span>Rs {Number(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 pt-2 border-t border-gray-100 font-semibold text-sm">
                <span>Total</span><span>Rs {Number(o.total).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
