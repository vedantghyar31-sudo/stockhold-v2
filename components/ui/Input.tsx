import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{label}</label>}
      <div className="relative">
        {prefix && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
        <input
          ref={ref}
          className={cn(
            'w-full border rounded-xl text-sm transition-all outline-none',
            'px-4 py-3 bg-white dark:bg-slate-800',
            'border-gray-200 dark:border-slate-700',
            'text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            prefix && 'pl-8',
            error && 'border-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
