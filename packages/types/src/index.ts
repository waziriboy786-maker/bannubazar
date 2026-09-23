// Shared types/enums used across api, web, and mobile.
// This is the single source of truth — do not redefine these elsewhere.

export const Role = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  DELIVERY_PARTNER: "DELIVERY_PARTNER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ProductStatus = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const ShopStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  CLOSED: "CLOSED",
} as const;
export type ShopStatus = (typeof ShopStatus)[keyof typeof ShopStatus];

export const VerificationStatus = {
  NOT_STARTED: "NOT_STARTED",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  PACKED: "PACKED",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  ASSIGNED_TO_RIDER: "ASSIGNED_TO_RIDER",
  PICKED_UP: "PICKED_UP",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  COD_PENDING: "COD_PENDING",
  COD_COLLECTED: "COD_COLLECTED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}
export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export interface UserDTO {
  id: string;
  role: Role;
  name: string;
  email: string | null;
  phone: string | null;
  profileImage: string | null;
  status: string;
  createdAt: string;
}

export interface ProductDTO {
  id: string;
  sellerId: string;
  shopId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  sku: string | null;
  brand: string | null;
  condition: string | null;
  status: ProductStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopDTO {
  id: string;
  sellerId: string;
  name: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  address: string | null;
  city: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ShopStatus;
  verificationStatus: VerificationStatus;
}

export interface OrderItemDTO {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderDTO {
  id: string;
  customerId: string;
  shopId: string;
  items: OrderItemDTO[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
}
