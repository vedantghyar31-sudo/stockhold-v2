'use client';
import { useEffect } from 'react';
import { useAuthStore, useSubStore } from '@/lib/store';
import { getSubscription, isAdminEmail } from '@/services/subscription';

export const useSubscription = () => {
  const user = useAuthStore((s) => s.user);
  const { subscription, subLoading, setSubscription, setSubLoading, isActive } = useSubStore();

  useEffect(() => {
    if (!user) { setSubLoading(false); return; }
    setSubLoading(true);
    (async () => {
      if (user.email && await isAdminEmail(user.email)) {
        setSubscription({ status: 'active', startDate: null, expiryDate: null, planAmount: 0 } as any);
      } else {
        setSubscription(await getSubscription(user.uid));
      }
      setSubLoading(false);
    })();
  }, [user]);

  return { subscription, subLoading, isActive: isActive() };
};
