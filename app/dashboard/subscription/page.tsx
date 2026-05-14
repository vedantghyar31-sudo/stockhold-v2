'use client';
import { useState } from 'react';
import { Crown, CheckCircle, XCircle, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useSubscription } from '@/hooks/useSubscription';
import { activateSubscription } from '@/services/subscription';
import { formatINR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

declare global { interface Window { Razorpay: any; } }

const FEATURES = [
  'Unlimited product management',
  'Billing & professional invoice generation',
  'PDF receipts with shop branding & logo',
  'WhatsApp invoice sharing',
  'Full transaction history & bill editing',
  'Analytics with timeline filters',
  'Barcode & OCR scan-to-search',
  'Dark mode',
  'Multi-device access',
];

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const { subscription, subLoading, isActive } = useSubscription();
  const [paying, setPaying] = useState(false);

  const load = (): Promise<boolean> => new Promise((res) => {
    if (window.Razorpay) { res(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => res(true); s.onerror = () => res(false);
    document.body.appendChild(s);
  });

  const handleSubscribe = async () => {
    if (!user) return;
    setPaying(true);
    const ok = await load();
    if (!ok) { toast.error('Payment gateway failed to load.'); setPaying(false); return; }
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) { toast.error('Razorpay key not configured.'); setPaying(false); return; }

    const rzp = new window.Razorpay({
      key,
      amount:      2000 * 100,
      currency:    'INR',
      name:        'Stockhold',
      description: 'Monthly Subscription – ₹2,000/month',
      handler: async (response: any) => {
        try {
          await activateSubscription(user.uid, response.razorpay_payment_id, response.razorpay_order_id || 'direct');
          toast.success('Subscription activated! 🎉');
          window.location.reload();
        } catch { toast.error('Activation failed. Contact support.'); }
      },
      prefill:  { name: user.displayName || '', email: user.email || '' },
      theme:    { color: '#3b82f6' },
      modal:    { ondismiss: () => setPaying(false) },
    });
    rzp.on('payment.failed', () => { toast.error('Payment failed.'); setPaying(false); });
    rzp.open();
  };

  const expiryDate = subscription?.expiryDate?.toDate ? format(subscription.expiryDate.toDate(), 'dd MMM yyyy') : null;
  const startDate  = subscription?.startDate?.toDate  ? format(subscription.startDate.toDate(),  'dd MMM yyyy') : null;

  if (subLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Subscription</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Manage your Stockhold plan</p>
      </div>

      {/* Status banner */}
      {isActive ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 mb-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle size={19} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-green-800 dark:text-green-400">Active Subscription</p>
            <p className="text-sm text-green-600 dark:text-green-500 mt-0.5">All features unlocked.</p>
            <div className="flex gap-4 mt-2 text-xs text-green-700 dark:text-green-500">
              {startDate  && <span><strong>Started:</strong> {startDate}</span>}
              {expiryDate && <span><strong>Renews:</strong>  {expiryDate}</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 mb-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
            <XCircle size={19} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-red-800 dark:text-red-400">No Active Subscription</p>
            <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">Subscribe to unlock billing, analytics & all premium features.</p>
          </div>
        </div>
      )}

      {/* Plan card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden mb-5">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Crown size={19} />
            <span className="font-bold text-lg font-display">Stockhold Pro</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold">₹2,000</span>
            <span className="text-white/70 mb-1">/ month</span>
          </div>
          <p className="text-white/70 text-sm mt-1">Everything you need to run your shop</p>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">What's included</p>
          <ul className="space-y-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle size={14} className="text-green-500 shrink-0" />{f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button onClick={handleSubscribe} loading={paying} className="w-full py-3.5">
        <Crown size={17} />{isActive ? 'Renew Subscription' : `Subscribe – ${formatINR(2000)}/month`}
      </Button>
      <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-3">Powered by Razorpay · Secure payment</p>
    </div>
  );
}
