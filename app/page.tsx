'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Package } from 'lucide-react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) router.replace(user ? '/dashboard' : '/auth/login');
  }, [user, loading, router]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
        <Package className="text-white" size={26} />
      </div>
      <Loader2 className="text-blue-500 animate-spin" size={22} />
    </div>
  );
}
