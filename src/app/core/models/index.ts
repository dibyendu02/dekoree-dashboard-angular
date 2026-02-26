// ─── Auth ─────────────────────────────────────────────────────
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// ─── User ─────────────────────────────────────────────────────
export interface User {
  _id: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  lastLoginDate?: string;
  addresses?: Address[];
  wishlist?: string[];
  cart?: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface CartItem {
  product: string;
  quantity: number;
}

// ─── Product ──────────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string | Category;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images?: string[];
  stock?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  codAvailable?: boolean;
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  productType?: string;
  plantType?: string;
  color?: string;
  waterRequirement?: string;
  sunlightRequirement?: string;
  faqs?: FAQ[];
  metaTags?: string[];
  inStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

// ─── Order ────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'rto_initiated'
  | 'rto_delivered';

export interface Order {
  _id: string;
  orderNumber?: string;
  user?: User | string;
  products?: OrderProduct[];
  totalAmount?: number;
  status?: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: Address;
  couponApplied?: string;
  trackingInfo?: TrackingInfo;
  refundDetails?: RefundDetails;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderProduct {
  product?: Product | string;
  name?: string;
  quantity?: number;
  price?: number;
  image?: string;
}

export interface TrackingInfo {
  trackingId?: string;
  carrier?: string;
  status?: string;
  estimatedDelivery?: string;
}

export interface RefundDetails {
  amount?: number;
  status?: string;
  reason?: string;
  processedAt?: string;
}

export interface ShipmentRequest {
  length: number;
  width: number;
  height: number;
  weight: number;
}

// ─── Coupon ───────────────────────────────────────────────────
export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount?: number;
  isActive?: boolean;
  isPublic?: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  paymentMethods?: string[];
  targetUsers?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── Banner ───────────────────────────────────────────────────
export interface Banner {
  _id: string;
  image?: string;
  mobileImage?: string;
  type?: 'promotional' | 'informational' | 'seasonal' | 'category' | 'product';
  position?: 'hero' | 'category' | 'product' | 'footer' | 'popup' | 'sidebar';
  description?: string;
  link?: string;
  buttonText?: string;
  isActive?: boolean;
  deviceTarget?: 'desktop' | 'mobile' | 'tablet' | 'all';
  targetAudience?: 'all' | 'new' | 'returning' | 'premium';
  displayOrder?: number;
  startDate?: string;
  endDate?: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  animation?: string;
  autoHideAfterClick?: boolean;
  bgColor?: string;
  textColor?: string;
  buttonColor?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Category & Attributes ────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  image?: string;
  createdAt?: string;
}

export interface ColorOption {
  _id: string;
  name: string;
}

export interface ProductType {
  _id: string;
  name: string;
}

export interface PlantType {
  _id: string;
  name: string;
}

// ─── Analytics ────────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue?: number;
  totalOrders?: number;
  totalUsers?: number;
  totalProducts?: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  usersGrowth?: number;
  productsGrowth?: number;
  averageOrderValue?: number;
  pendingOrders?: number;
  completedOrders?: number;
  conversionRate?: number;
  recentOrders?: Order[];
  recentUsers?: User[];
  topProducts?: Product[];
  alerts?: string[];
}

export interface SalesAnalytics {
  salesByDate?: { date: string; amount: number; orders: number }[];
  salesByCategory?: { category: string; amount: number }[];
  salesByPaymentMethod?: { method: string; amount: number }[];
  topSellingProducts?: Product[];
}

// ─── API ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

// ─── Toast ────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}
