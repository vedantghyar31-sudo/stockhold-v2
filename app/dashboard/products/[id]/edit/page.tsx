'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getProduct, updateProduct, uploadProductImage } from '@/services/products';
import { ProductForm } from '@/components/products/ProductForm';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProduct(user.uid, id).then(setProduct);
  }, [user, id]);

  const handleSubmit = async (data: Partial<Product>, imageFile?: File) => {
    if (!user || !product) return;
    setLoading(true);
    try {
      let imageUrl = data.imageUrl;
      if (imageFile) imageUrl = await uploadProductImage(user.uid, imageFile, product.id);
      await updateProduct(user.uid, product.id, { ...data, imageUrl });
      toast.success('Product updated!');
      router.replace(`/dashboard/products/${product.id}`);
    } catch { toast.error('Failed to update'); }
    finally { setLoading(false); }
  };

  if (!product) return (
    <div className="max-w-xl mx-auto flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-5 text-sm font-medium">
        <ArrowLeft size={17} /> Back
      </button>
      <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">Edit Product</h1>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
        <ProductForm initialData={product} onSubmit={handleSubmit} loading={loading} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
