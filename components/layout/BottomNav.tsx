'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, FileText, BarChart2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard',              label: 'Home',     icon: LayoutDashboard, exact: true  },
  { href: '/dashboard/billing',      label: 'Billing',  icon: Receipt,         exact: false },
  { href: '/dashboard/transactions', label: 'History',  icon: FileText,        exact: false },
  { href: '/dashboard/analytics',    label: 'Analytics',icon: BarChart2,       exact: false },
  { href: '/dashboard/profile',      label: 'Profile',  icon: User,            exact: false },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pb-safe">
      <div className="flex">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-all',
                active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
