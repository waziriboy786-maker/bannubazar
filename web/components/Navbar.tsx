"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-brand-600 shrink-0">
          Bannu<span className="text-gray-800">Bazaar</span>
        </Link>

        <form
          action="/search"
          className="flex-1 hidden sm:flex"
          onSubmit={(e) => { e.preventDefault(); window.location.href = `/search?q=${encodeURIComponent(query)}`; }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, shops, categories..."
            className="w-full border border-gray-300 rounded-l-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button className="bg-brand-600 text-white rounded-r-full px-5 text-sm font-medium hover:bg-brand-700">
            Search
          </button>
        </form>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-700 shrink-0">
          <Link href="/search" className="hover:text-brand-600">Categories</Link>
          <Link href="/cart" className="hover:text-brand-600">Cart</Link>
          {user ? (
            <>
              <Link href="/orders" className="hover:text-brand-600">Orders</Link>
              {user.role === "SELLER" && <Link href="/dashboard/seller" className="hover:text-brand-600">Seller</Link>}
              {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                <Link href="/dashboard/admin" className="hover:text-brand-600">Admin</Link>
              )}
              <button onClick={() => logout()} className="hover:text-brand-600">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand-600">Login</Link>
              <Link href="/register" className="bg-brand-600 text-white px-4 py-1.5 rounded-full hover:bg-brand-700">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around py-2 z-40">
        <Link href="/" className="flex flex-col items-center text-xs text-gray-600">🏠<span>Home</span></Link>
        <Link href="/search" className="flex flex-col items-center text-xs text-gray-600">🔍<span>Search</span></Link>
        <Link href="/cart" className="flex flex-col items-center text-xs text-gray-600">🛒<span>Cart</span></Link>
        <Link href={user ? "/orders" : "/login"} className="flex flex-col items-center text-xs text-gray-600">
          👤<span>{user ? "Orders" : "Login"}</span>
        </Link>
      </nav>
    </header>
  );
}
