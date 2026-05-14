'use client';
import { create } from 'zustand';
import { User } from 'firebase/auth';
import { BillItem, ShopProfile, Subscription } from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
interface AuthState {
  user:       User | null;
  loading:    boolean;
  setUser:    (u: User | null) => void;
  setLoading: (v: boolean) => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user:       null,
  loading:    true,
  setUser:    (user)    => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

// ─── Cart (Bill items) ────────────────────────────────────────────────────────
interface CartState {
  items:      BillItem[];
  addItem:    (item: BillItem) => void;
  updateQty:  (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart:  () => void;
  total:      () => number;
}
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find((i) => i.productId === item.productId);
    if (existing) {
      set((s) => ({
        items: s.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.unitPrice }
            : i
        ),
      }));
    } else {
      set((s) => ({ items: [...s.items, item] }));
    }
  },
  updateQty: (productId, qty) => {
    if (qty <= 0) {
      set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }));
    } else {
      set((s) => ({
        items: s.items.map((i) =>
          i.productId === productId ? { ...i, quantity: qty, total: qty * i.unitPrice } : i
        ),
      }));
    }
  },
  removeItem: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  clearCart:  () => set({ items: [] }),
  total:      () => get().items.reduce((sum, i) => sum + i.total, 0),
}));

// ─── Shop Profile ─────────────────────────────────────────────────────────────
interface ShopState {
  profile:    ShopProfile | null;
  setProfile: (p: ShopProfile | null) => void;
}
export const useShopStore = create<ShopState>((set) => ({
  profile:    null,
  setProfile: (profile) => set({ profile }),
}));

// ─── Subscription ─────────────────────────────────────────────────────────────
interface SubState {
  subscription: Subscription | null;
  subLoading:   boolean;
  setSubscription: (s: Subscription | null) => void;
  setSubLoading:   (v: boolean) => void;
  isActive:     () => boolean;
}
export const useSubStore = create<SubState>((set, get) => ({
  subscription: null,
  subLoading:   true,
  setSubscription: (s) => set({ subscription: s }),
  setSubLoading:   (v) => set({ subLoading: v }),
  isActive: () => {
    const sub = get().subscription;
    if (!sub || sub.status !== 'active') return false;
    if (!sub.expiryDate) return true; // admin / lifetime
    return sub.expiryDate.toDate() > new Date();
  },
}));
