"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Stats {
  totalUsers: number; activeSellers: number; activeShops: number; deliveryPartners: number;
  totalProducts: number; totalOrders: number; pendingOrders: number; pendingVerifications: number; openReports: number;
}
interface SellerApp { id: string; businessName: string; verificationStatus: string; user: { name: string; email: string | null; phone: string | null }; }
interface PendingProduct { id: string; name: string; price: string | number; shop: { name: string }; }

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [sellerApps, setSellerApps] = useState<SellerApp[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const isAdmin = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");

  const loadAll = () => {
    api.get<Stats>("/admin/dashboard").then(setStats).catch(() => {});
    api.get<SellerApp[]>("/admin/sellers?status=SUBMITTED").then(setSellerApps).catch(() => {});
    api.get<PendingProduct[]>("/admin/products/pending").then(setPendingProducts).catch(() => {});
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) { router.push("/login"); return; }
    if (isAdmin) loadAll();
  }, [user, authLoading]);

  const reviewSeller = async (id: string, decision: "VERIFIED" | "REJECTED") => {
    try {
      await api.patch(`/admin/sellers/${id}/review`, { decision });
      setNotice(`Seller application ${decision.toLowerCase()}.`);
      loadAll();
    } catch (e) {
      setNotice(e instanceof ApiRequestError ? e.message : "Action failed.");
    }
  };

  const reviewProduct = async (id: string, decision: "ACTIVE" | "REJECTED") => {
    try {
      await api.patch(`/admin/products/${id}/review`, { decision });
      setNotice(`Product ${decision === "ACTIVE" ? "approved" : "rejected"}.`);
      loadAll();
    } catch (e) {
      setNotice(e instanceof ApiRequestError ? e.message : "Action failed.");
    }
  };

  if (!stats) return <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-500">Loading admin dashboard…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8 space-y-8">
      <h1 className="text-xl font-bold">Admin dashboard</h1>
      {notice && <p className="text-sm text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">{notice}</p>}

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          ["Total users", stats.totalUsers], ["Active sellers", stats.activeSellers], ["Active shops", stats.activeShops],
          ["Delivery partners", stats.deliveryPartners], ["Total products", stats.totalProducts],
          ["Total orders", stats.totalOrders], ["Pending orders", stats.pendingOrders],
          ["Pending verifications", stats.pendingVerifications], ["Open reports", stats.openReports],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold mt-1">{value as number}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Pending seller applications</h2>
        <div className="space-y-2">
          {sellerApps.map((s) => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{s.businessName}</p>
                <p className="text-xs text-gray-500">{s.user.name} · {s.user.email ?? s.user.phone}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => reviewSeller(s.id, "VERIFIED")} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
                <button onClick={() => reviewSeller(s.id, "REJECTED")} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">Reject</button>
              </div>
            </div>
          ))}
          {sellerApps.length === 0 && <p className="text-sm text-gray-500">No pending applications.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Pending product approvals</h2>
        <div className="space-y-2">
          {pendingProducts.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">{p.shop.name} · Rs {Number(p.price).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => reviewProduct(p.id, "ACTIVE")} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Approve</button>
                <button onClick={() => reviewProduct(p.id, "REJECTED")} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">Reject</button>
              </div>
            </div>
          ))}
          {pendingProducts.length === 0 && <p className="text-sm text-gray-500">No products awaiting review.</p>}
        </div>
      </section>
    </div>
  );
}
