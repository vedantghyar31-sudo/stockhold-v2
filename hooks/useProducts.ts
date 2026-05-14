'use client';
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { getProducts } from '@/services/products';

export const useProducts = (uid: string | undefined) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  const fetch = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    setProducts(await getProducts(uid));
    setLoading(false);
  }, [uid]);

  useEffect(() => { fetch(); }, [fetch]);
  return { products, loading, refetch: fetch };
};
