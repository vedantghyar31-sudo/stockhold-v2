import {
  collection, addDoc, getDocs, getDoc, doc,
  query, orderBy, where, Timestamp, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bill, PaymentStatus, PaymentType } from '@/types';

const path = (uid: string) => `users/${uid}/bills`;

export const getBills = async (uid: string): Promise<Bill[]> => {
  const snap = await getDocs(query(collection(db, path(uid)), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bill));
};

export const getBill = async (uid: string, bid: string): Promise<Bill | null> => {
  const snap = await getDoc(doc(db, path(uid), bid));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Bill) : null;
};

export const getBillsByRange = async (uid: string, start: Date, end: Date): Promise<Bill[]> => {
  const snap = await getDocs(
    query(
      collection(db, path(uid)),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bill));
};

export const addBill = async (uid: string, bill: Omit<Bill, 'id' | 'createdAt' | 'userId'>): Promise<string> => {
  const r = await addDoc(collection(db, path(uid)), { ...bill, userId: uid, createdAt: serverTimestamp() });
  return r.id;
};

export const updateBill = async (
  uid: string, bid: string,
  updates: { paymentStatus?: PaymentStatus; paymentType?: PaymentType; paidAmount?: number; remainingAmount?: number; notes?: string }
): Promise<void> => updateDoc(doc(db, path(uid), bid), updates);
