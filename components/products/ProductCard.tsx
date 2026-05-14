'use client';
import { Product } from '@/types';
import { AlertTriangle, Package, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Props { product: Product; onClick: () => void; }

export function ProductCard({ product, onClick }: Props) {
  const low     = product.quantity < 5;
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.quantity < 1) { toast.error('Out of stock'); return; }
    addItem({ productId: product.id, productName: product.name, quantity: 1, unitPrice: product.sellingPrice, total: product.sellingPrice });
    toast.success(`${product.name} added to bill`);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative w-full h-36 bg-gray-50 dark:bg-slate-700 overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package size={30} className="text-gray-200 dark:text-slate-600" />
          </div>
        )}
        {low && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle size={11} className="text-white" />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate mb-0.5">{product.name}</p>
        <p className="text-blue-500 font-bold text-base">{formatINR(product.sellingPrice)}</p>
        <div className="flex items-center justify-between mt-1">
          <span className={cn('text-xs font-medium', low ? 'text-red-500' : 'text-gray-400 dark:text-slate-500')}>
            {product.quantity} left
          </span>
          {low && <span className="text-xs text-red-500 font-medium">Low stock</span>}
        </div>
        <button
          onClick={handleAdd}
          disabled={product.quantity < 1}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={11} /> Add to Bill
        </button>
      </div>
    </div>
  );
}
