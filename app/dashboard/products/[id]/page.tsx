'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, ShoppingCart, Plus, AlertTriangle, Package } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/lib/store';
import { getProduct, deleteProduct } from '@/services/products';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { SellModal } from '@/components/billing/SellModal';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const addItem   = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSell,setShowSell]= useState(false);
  const [deleting,setDeleting]= useState(false);

  useEffect(() => {
    if (!user) return;
    getProduct(user.uid, id).then((p) => { setProduct(p); setLoading(false); });
  }, [user, id]);

  const handleDelete = async () => {
    if (!user || !product || !confirm('Delete this product?')) return;
    setDeleting(true);
    try { await deleteProduct(user.uid, product.id); toast.success('Deleted'); router.replace('/dashboard'); }
    catch { toast.error('Failed to delete'); setDeleting(false); }
  };

  const handleAddToBill = () => {
    if (!product || product.quantity < 1) { toast.error('Out of stock'); return; }
    addItem({ productId: product.id, productName: product.name, quantity: 1, unitPrice: product.sellingPrice, total: product.sellingPrice });
    toast.success('Added to bill');
  };

  if (loading) return (
    <div className="max-w-xl mx-auto space-y-4 animate-pulse">
      <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-2xl" />
      <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <Package size={40} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
      <p className="text-gray-500">Product not found</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-500 text-sm font-medium">Go back</button>
    </div>
  );

  const profit = product.sellingPrice - product.costPrice;
  const margin = product.sellingPrice > 0 ? ((profit / product.sellingPrice) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-5 text-sm font-medium">
        <ArrowLeft size={17} /> Back
      </button>

      {/* Image */}
      <div className="relative w-full h-64 bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden mb-5 border border-gray-100 dark:border-slate-700">
        {product.imageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          : <div className="flex items-center justify-center h-full"><Package size={56} className="text-gray-300 dark:text-slate-600" /></div>}
        {product.quantity < 5 && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <AlertTriangle size={11} /> Low Stock
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 mb-4">
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-1">{product.name}</h1>
        {product.barcode && <p className="text-xs text-gray-400 font-mono mb-4">Barcode: {product.barcode}</p>}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
            <p className="text-xs text-blue-500 mb-0.5">Selling Price</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{formatINR(product.sellingPrice)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5">Cost Price</p>
            <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatINR(product.costPrice)}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
            <p className="text-xs text-green-500 mb-0.5">Profit / unit</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-400">{formatINR(profit)}</p>
          </div>
          <div className={`rounded-xl p-3 ${product.quantity < 5 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-slate-700/50'}`}>
            <p className={`text-xs mb-0.5 ${product.quantity < 5 ? 'text-red-500' : 'text-gray-500'}`}>In Stock</p>
            <p className={`text-xl font-bold ${product.quantity < 5 ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>{product.quantity}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400">Margin: <span className="font-semibold text-gray-700 dark:text-gray-200">{margin}%</span></p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button onClick={() => setShowSell(true)} className="flex-1 py-3"><ShoppingCart size={16} /> Quick Sell</Button>
          <Button onClick={handleAddToBill} variant="secondary" className="flex-1 py-3"><Plus size={16} /> Add to Bill</Button>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push(`/dashboard/products/${product.id}/edit`)} variant="secondary" className="flex-1 py-2.5"><Edit size={15} /> Edit</Button>
          <Button onClick={handleDelete} loading={deleting} variant="danger" className="flex-1 py-2.5"><Trash2 size={15} /> Delete</Button>
        </div>
      </div>

      {showSell && <SellModal product={product} onClose={() => setShowSell(false)} onSold={(p) => { setProduct(p); setShowSell(false); }} />}
    </div>
  );
}
