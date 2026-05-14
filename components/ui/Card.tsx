import { cn } from '@/lib/utils';

interface CardProps {
  children:   React.ReactNode;
  className?: string;
  onClick?:   () => void;
  hover?:     boolean;
}

export function Card({ children, className, onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm',
        hover && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon:    React.ElementType;
  label:   string;
  value:   string;
  sub?:    string;
  color:   string;
}) {
  return (
    <Card className="p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">{label}</p>
      <p className="text-lg font-bold font-display text-gray-900 dark:text-white leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </Card>
  );
}
