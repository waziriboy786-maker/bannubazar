import Link from "next/link";

const ICONS: Record<string, string> = {
  Men: "👔", Women: "👗", Kids: "🧸", Fashion: "🧥", Shoes: "👟", Electronics: "🔌",
  "Mobile Phones": "📱", "Mobile Accessories": "🎧", Computers: "💻", Beauty: "💄",
  Grocery: "🛒", Kitchen: "🍳", Home: "🏠", Furniture: "🛋️", Watches: "⌚",
  Jewelry: "💍", Sports: "⚽", Books: "📚", Automotive: "🚗", Services: "🛠️", Other: "📦",
};

export default function CategoryGrid({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/search?categoryId=${c.id}`}
          className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-sm transition text-center"
        >
          <span className="text-2xl">{ICONS[c.name] ?? "🏷️"}</span>
          <span className="text-xs text-gray-700 line-clamp-1">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
