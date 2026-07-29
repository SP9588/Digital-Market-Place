export type CategoryId =
  | 'books'
  | 'education'
  | 'music'
  | 'audio'
  | 'video'
  | 'photography'
  | 'graphics'
  | 'templates'
  | 'software'
  | 'website'
  | 'ai_products'
  | 'design_resources'
  | 'business'
  | 'productivity'
  | 'gaming'
  | '3d_assets'
  | 'ar_vr'
  | 'marketing'
  | 'nfts'
  | 'gift_cards'
  | 'creative_assets'
  | 'digital_services'
  | 'memberships'
  | 'licensed_content';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string;
  subcategories: string[];
  productCount: number;
}

export type LicenseType = 'personal' | 'commercial' | 'extended' | 'enterprise';

export interface LicenseOption {
  type: LicenseType;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export type PreviewType =
  | 'image'
  | 'audio'
  | 'video'
  | 'code'
  | '3d'
  | 'pdf'
  | 'preset'
  | 'giftcard';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface DigitalProduct {
  id: string;
  title: string;
  slug: string;
  categoryId: CategoryId;
  categoryName: string;
  subcategory: string;
  price: number;
  salePrice?: number;
  currency: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRating: number;
  creatorSales: number;
  rating: number;
  reviewCount: number;
  fileFormat: string;
  fileSize: string;
  downloadCount: number;
  tags: string[];
  description: string;
  features: string[];
  previewType: PreviewType;
  previewUrl: string;
  audioSampleUrl?: string;
  codeSnippet?: string;
  model3dType?: string;
  pdfSamplePages?: string[];
  beforeAfterImages?: { before: string; after: string };
  giftCardBrand?: string;
  licenses: LicenseOption[];
  attributes: Record<string, string>;
  isFeatured?: boolean;
  isVerified?: boolean;
  dateAdded: string;
}

export interface CartItem {
  product: DigitalProduct;
  selectedLicense: LicenseType;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  marketplaceFee: number;
  tax: number;
  total: number;
  currency: string;
  paymentGateway: 'stripe' | 'razorpay' | 'paypal' | 'crypto' | 'upi_qr';
  paymentMethodDetails: string;
  status: 'completed' | 'processing' | 'refunded';
  date: string;
  invoiceNumber: string;
  buyerEmail: string;
  buyerName: string;
  licenseKeys: Record<string, string>;
  downloadLinks: Record<string, string>;
}

export interface SellerAccount {
  id: string;
  storeName: string;
  sellerName: string;
  avatar: string;
  bio: string;
  totalSales: number;
  totalRevenue: number;
  openOceanCommissionRate: number; // e.g. 0.10 (10%)
  payoutSchedule: 'instant' | 'weekly' | 'monthly';
  connectedGateway: string;
  balancePending: number;
  balanceAvailable: number;
}

export interface FilterState {
  categoryId?: CategoryId | 'all';
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  licenseType?: LicenseType | 'all';
  rating?: number;
  search?: string;
  sortBy: 'popular' | 'newest' | 'price_low' | 'price_high' | 'rating';
  format?: string;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD';

export interface PriceAlert {
  id: string;
  productId: string;
  targetPrice: number; // target price in USD or current currency
  currency: Currency;
  createdAt: string;
  note?: string;
  active: boolean;
}

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  rate: number; // Relative to USD
}

export type ActivityType = 'view' | 'wishlist' | 'cart' | 'purchase' | 'compare' | 'alert';

export interface ActivityLogItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  productId?: string;
  productPreviewUrl?: string;
  amountUsd?: number;
}

export type RoadmapStatus = 'in_progress' | 'planned' | 'under_review' | 'completed';
export type RoadmapCategory = 'platform_feature' | 'category_request' | 'integration';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: RoadmapCategory;
  status: RoadmapStatus;
  votes: number;
  estimatedQuarter?: string;
  tags: string[];
  submittedBy?: string;
}

export interface ProductBundle {
  id: string;
  title: string;
  description: string;
  productIds: string[];
  discountPercentage: number;
  badge?: string;
  bannerImage?: string;
}

