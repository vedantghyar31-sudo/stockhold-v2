import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Subscription } from '@/types';

const path = (uid: string) => `users/${uid}/subscription/info`;

export const getSubscription = async (uid: string): Promise<Subscription | null> => {
  const snap = await getDoc(doc(db, path(uid)));
  return snap.exists() ? (snap.data() as Subscription) : null;
};

export const activateSubscription = async (uid: string, paymentId: string, orderId: string): Promise<void> => {
  const now    = new Date();
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + 1);
  await setDoc(doc(db, path(uid)), {
    status:             'active',
    startDate:          Timestamp.fromDate(now),
    expiryDate:         Timestamp.fromDate(expiry),
    planAmount:         2000,
    razorpayPaymentId:  paymentId,
    razorpayOrderId:    orderId,
  });
};

export const isAdminEmail = async (email: string): Promise<boolean> => {
  try {
    const snap = await getDoc(doc(db, 'config', 'admins'));
    if (!snap.exists()) return false;
    const emails: string[] = snap.data().emails || [];
    return emails.map((e) => e.toLowerCase()).includes(email.toLowerCase());
  } catch { return false; }
};
