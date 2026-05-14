'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore, useShopStore } from '@/lib/store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Image from 'next/image';

export function TopBar() {
  const user    = useAuthStore((s) => s.user);
  const profile = useShopStore((s) => s.profile);
  const router  = useRouter();
  const name    = user?.displayName?.split(' ')[0] || 'Shop Owner';

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs text-gray-400 dark:text-slate-500">Good day,</p>
        <h1 className="text-xl font-bold font-display text-gray-900 dark:text-white">{name} 👋</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={() => router.push('/dashboard/profile')}
          className="w-10 h-10 rounded-xl overflow-hidden bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-all flex items-center justify-center"
        >
          {user?.photoURL
            ? <Image src={user.photoURL} alt="avatar" width={40} height={40} className="object-cover" />
            : <span className="text-blue-600 dark:text-blue-400 font-bold text-sm font-display">
                {user?.displayName?.[0]?.toUpperCase() || 'S'}
              </span>}
        </button>
      </div>
    </div>
  );
}
