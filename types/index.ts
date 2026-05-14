import { Timestamp } from 'firebase/firestore';

// ─── Product ─────────────────────────────────────────────────────────────────
export interface Product {
  id:           string;
  name:         string;
  imageUrl:     string;
  sellingPrice: number;
  costPrice:    number;
  quantity:     number;
  barcode:      string;
  createdAt:    Timestamp;
  userId:       string;
}

// ─── Bill ─────────────────────────────────────────────────────────────────────
export interface BillItem {
  productId:   string;
  productName: string;
  quantity:    number;
  unitPrice:   number;
  total:       number;
}

export type PaymentType   = 'cash' | 'online';
export type PaymentStatus = 'successful' | 'pending' | 'half_paid' | 'returned';

export interface Bill {
  id:              string;
  invoiceId:       string;
  userId:          string;
  shopName?:       string;
  shopAddress?:    string;
  shopPhone?:      string;
  shopLogo?:       string;
  customerName:    string;
  customerMobile:  string;
  items:           BillItem[];
  subtotal:        number;
  totalAmount:     number;
  paidAmount:      number;
  remainingAmount: number;
  paymentType:     PaymentType;
  paymentStatus:   PaymentStatus;
  notes?:          string;
  createdAt:       Timestamp;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface ShopProfile {
  shopName:    string;
  shopLogo:    string;
  shopAddress: string;
  shopPhone:   string;
  displayName: string;
  email:       string;
  photoURL:    string;
  createdAt?:  Timestamp;
}

// ─── Subscription ─────────────────────────────────────────────────────────────
export type SubscriptionStatus = 'active' | 'inactive' | 'expired';

export interface Subscription {
  status:             SubscriptionStatus;
  startDate:          Timestamp | null;
  expiryDate:         Timestamp | null;
  planAmount:         number;
  razorpayPaymentId?: string;
  razorpayOrderId?:   string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export type TimeFilter = 'today' | 'week' | 'month' | 'year';

export interface AnalyticsSummary {
  totalRevenue:    number;
  totalProfit:     number;
  totalBills:      number;
  paidBills:       number;
  pendingBills:    number;
  halfPaidBills:   number;
  returnedBills:   number;
  collectedAmount: number;
  pendingAmount:   number;
  chartData:       ChartPoint[];
}

export interface ChartPoint {
  date:    string;
  revenue: number;
  profit:  number;
}
