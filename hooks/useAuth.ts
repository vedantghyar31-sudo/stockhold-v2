'use client';
import { useEffect } from 'react';
import { onAuthChange } from '@/services/auth';
import { useAuthStore } from '@/lib/store';

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore();
  useEffect(() => {
    const unsub = onAuthChange((u) => { setUser(u); setLoading(false); });
    return unsub;
  }, [setUser, setLoading]);
  return { user, loading };
};
