import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 mb-14 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h4 className="text-white font-semibold mb-2">BannuBazaar</h4>
          <p className="text-gray-400">Your local marketplace for Bannu, Khyber Pakhtunkhwa.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Company</h4>
          <ul className="space-y-1">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/help">Help / Support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Legal</h4>
          <ul className="space-y-1">
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Join us</h4>
          <ul className="space-y-1">
            <li><Link href="/register?role=SELLER">Become a seller</Link></li>
            <li><Link href="/register?role=DELIVERY_PARTNER">Become a rider</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
