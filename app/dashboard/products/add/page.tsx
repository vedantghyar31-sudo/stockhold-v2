'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { addProduct, uploadProductImage, updateProduct } from '@/services/products';
import { ProductForm } from '@/components/products/ProductForm';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  const user   = useAuthStore((s) => s.user);
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Partial<Product>, imageFile?: File) => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Upload image first (if any) — get URL before creating Firestore doc
      let imageUrl = '';
      if (imageFile) {
        try {
          imageUrl = await uploadProductImage(imageFile);
        } catch (err) {
          console.error('Image upload failed:', err);
          toast.error('Image upload failed — product will be saved without image');
        }
      }

      // 2. Create product in Firestore with imageUrl already set
      const id = await addProduct(user.uid, {
        name:         data.name         || '',
        imageUrl,
        sellingPrice: data.sellingPrice || 0,
        costPrice:    data.costPrice    || 0,
        quantity:     data.quantity     || 0,
        barcode:      data.barcode      || '',
      });

      toast.success('Product added!');
      router.replace(`/dashboard/products/${id}`);
    } catch (err) {
      console.error('Add product error:', err);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white mb-5 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={17} /> Back
      </button>
      <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-6">Add Product</h1>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
        <ProductForm
          initialData={{ barcode: params.get('barcode') || '' }}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Add Product"
        />
      </div>
    </div>
  );
}
