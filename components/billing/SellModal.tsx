'use client';
import { useState } from 'react';
import { X, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { updateProduct } from '@/services/products';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  onClose: () => void;
  onSold:  (updated: Product) => void;
}

export function SellModal({ product, onClose, onSold }: Props) {
  const user = useAuthStore((s) => s.user);
  const [qty,     setQty]     = useState(1);
  const [loading, setLoading] = useState(false);

  const revenue = qty * product.sellingPrice;
  const profit  = qty * (product.sellingPrice - product.costPrice);

  const handleSell = async () => {
    if (!user || qty > product.quantity) { toast.error('Not enough stock'); return; }
    setLoading(true);
    try {
      const newQty = product.quantity - qty;
      await updateProduct(user.uid, product.id, { quantity: newQty });
      toast.success(`Sold ${qty} × ${product.name}`);
      onSold({ ...product, quantity: newQty });
    } catch { toast.error('Failed to record sale'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingCart size={17} className="text-blue-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Quick Sell</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
        </div>
        <div className="px-5 py-5 space-y-5">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Selling</p>
            <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{product.quantity} available</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                <Minus size={14} />
              </button>
              <span className="text-2xl font-bold text-gray-900 dark:text-white w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.quantity, q + 1))} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-slate-400"><span>Unit Price</span><span>{formatINR(product.sellingPrice)}</span></div>
            <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold"><span>Revenue</span><span>{formatINR(revenue)}</span></div>
            <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold"><span>Profit</span><span>{formatINR(profit)}</span></div>
          </div>
          <Button onClick={handleSell} loading={loading} className="w-full py-3">
            <ShoppingCart size={16} /> Confirm · {formatINR(revenue)}
          </Button>
        </div>
      </div>
    </div>
  );
}
