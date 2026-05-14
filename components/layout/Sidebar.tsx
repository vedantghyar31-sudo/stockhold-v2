'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, FileText, BarChart2, User, Crown, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV = [
  { href: '/dashboard',              label: 'Home',         icon: LayoutDashboard, exact: true  },
  { href: '/dashboard/billing',      label: 'Billing',      icon: Receipt,         exact: false },
  { href: '/dashboard/transactions', label: 'Transactions', icon: FileText,        exact: false },
  { href: '/dashboard/analytics',    label: 'Analytics',    icon: BarChart2,       exact: false },
  { href: '/dashboard/subscription', label: 'Subscription', icon: Crown,           exact: false },
  { href: '/dashboard/profile',      label: 'Profile',      icon: User,            exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
          <Package size={16} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white font-display">Stockhold</span>
      </div>
      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <p className="text-xs text-gray-300 dark:text-slate-600">v2.0.0</p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
