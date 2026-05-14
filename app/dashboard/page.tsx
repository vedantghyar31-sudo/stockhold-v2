'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Package, AlertTriangle, ScanLine } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { TopBar } from '@/components/layout/TopBar';
import { ScanToSearch } from '@/components/products/ScanToSearch';
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner';
import { getProductByBarcode } from '@/services/products';
import toast from 'react-hot-toast';

export default function HomePage() {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const { products, loading } = useProducts(user?.uid);
  const [search,    setSearch]    = useState('');
  const [showOCR,   setShowOCR]   = useState(false);
  const [showBCode, setShowBCode] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.barcode?.includes(q));
  }, [products, search]);

  const lowStock = products.filter((p) => p.quantity < 5).length;

  const handleBarcode = async (code: string) => {
    setShowBCode(false);
    if (!user) return;
    const product = await getProductByBarcode(user.uid, code);
    if (product) router.push(`/dashboard/products/${product.id}`);
    else { toast.error('Product not found'); router.push(`/dashboard/products/add?barcode=${code}`); }
  };

  return (
    <div>
      <TopBar />

      {/* Low stock alert */}
      {lowStock > 0 && (
        <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle size={15} className="shrink-0" />
          <span><strong>{lowStock} product{lowStock > 1 ? 's' : ''}</strong> {lowStock > 1 ? 'are' : 'is'} low on stock</span>
        </div>
      )}

      {/* Search row */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or barcode..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
        <button onClick={() => setShowBCode(true)}
          className="px-3.5 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
          title="Scan barcode">
          <ScanLine size={18} className="text-blue-500" />
        </button>
        <button onClick={() => setShowOCR(true)}
          className="hidden sm:flex px-3.5 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
          title="Scan product image">
          <Package size={15} className="text-blue-500" /> OCR
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Total Products</p>
          <p className="text-2xl font-bold font-display text-gray-900 dark:text-white">{products.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Low Stock</p>
          <p className="text-2xl font-bold font-display text-red-500">{lowStock}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold font-display text-gray-900 dark:text-white">
          {search ? `Results (${filtered.length})` : 'All Products'}
        </h2>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="h-56 skeleton rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
          <Package size={36} className="text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-slate-400 font-medium">{search ? 'No products found' : 'No products yet'}</p>
          <p className="text-gray-400 dark:text-slate-600 text-sm mt-1">{search ? 'Try a different term' : 'Add your first product'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => router.push(`/dashboard/products/${p.id}`)} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => router.push('/dashboard/products/add')}
        className="fixed bottom-24 lg:bottom-8 right-5 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-40"
      >
        <Plus size={24} />
      </button>

      {showOCR   && <ScanToSearch products={products} onClose={() => setShowOCR(false)} onFound={(id) => { setShowOCR(false); router.push(`/dashboard/products/${id}`); }} />}
      {showBCode && <BarcodeScanner onScanned={handleBarcode} onClose={() => setShowBCode(false)} />}
    </div>
  );
}
