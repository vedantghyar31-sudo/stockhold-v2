'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore, useShopStore } from '@/lib/store';
import { getProfile } from '@/services/profile';
import { Sidebar }   from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Watermark } from '@/components/ui/Watermark';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router    = useRouter();
  const setProfile = useShopStore((s) => s.setProfile);

  // load shop profile into global store once
  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then((p) => setProfile(p));
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center">
          <span className="text-white font-bold text-xl font-display">S</span>
        </div>
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
      <Watermark />
    </div>
  );
}
