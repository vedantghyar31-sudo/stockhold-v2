'use client';
import { useRouter } from 'next/navigation';
import { Crown, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/Button';

export function SubscriptionGate({ children, feature }: { children: React.ReactNode; feature?: string }) {
  const { isActive, subLoading } = useSubscription();
  const router = useRouter();

  if (subLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isActive) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-xs mx-auto px-4">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <Lock size={30} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-2">Subscription Required</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
          {feature ? `${feature} requires an active subscription.` : 'Subscribe to unlock all premium features.'} ₹2,000/month.
        </p>
        <Button onClick={() => router.push('/dashboard/subscription')} className="w-full">
          <Crown size={16} /> View Plans
        </Button>
      </div>
    </div>
  );

  return <>{children}</>;
}
