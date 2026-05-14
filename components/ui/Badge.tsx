import { cn } from '@/lib/utils';
import { PaymentStatus } from '@/types';

const STATUS_MAP: Record<PaymentStatus, { label: string; cls: string }> = {
  successful: { label: 'Paid',      cls: 'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400'  },
  pending:    { label: 'Pending',   cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  half_paid:  { label: 'Half Paid', cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  returned:   { label: 'Returned',  cls: 'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400'    },
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return (
    <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap', cls)}>{label}</span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full', className)}>{children}</span>
  );
}
