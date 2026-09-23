import Link from "next/link";

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  images: { imageUrl: string }[];
  shop?: { name: string; city?: string | null };
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

  return (
    <Link href={`/products/${product.id}`} className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem]">{product.name}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-brand-700 font-bold">Rs {price.toLocaleString()}</span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">Rs {product.price.toLocaleString()}</span>}
        </div>
        {product.shop && <p className="text-xs text-gray-500 mt-1 truncate">{product.shop.name}{product.shop.city ? ` · ${product.shop.city}` : ""}</p>}
      </div>
    </Link>
  );
}
