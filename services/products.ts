import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, orderBy, serverTimestamp, where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Product } from '@/types';

const path = (uid: string) => `users/${uid}/products`;

export const getProducts = async (uid: string): Promise<Product[]> => {
  const snap = await getDocs(query(collection(db, path(uid)), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
};

export const getProduct = async (uid: string, pid: string): Promise<Product | null> => {
  const snap = await getDoc(doc(db, path(uid), pid));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
};

export const getProductByBarcode = async (uid: string, barcode: string): Promise<Product | null> => {
  const snap = await getDocs(query(collection(db, path(uid)), where('barcode', '==', barcode)));
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Product);
};

export const addProduct = async (
  uid: string,
  data: Omit<Product, 'id' | 'createdAt' | 'userId'>
): Promise<string> => {
  const r = await addDoc(collection(db, path(uid)), { ...data, userId: uid, createdAt: serverTimestamp() });
  return r.id;
};

export const updateProduct = async (
  uid: string, pid: string,
  data: Partial<Omit<Product, 'id' | 'createdAt' | 'userId'>>
): Promise<void> => updateDoc(doc(db, path(uid), pid), data);

export const deleteProduct = async (uid: string, pid: string): Promise<void> => {
  const snap = await getDoc(doc(db, path(uid), pid));
  if (snap.exists()) {
    const url = snap.data().imageUrl as string;
    if (url?.includes('firebasestorage.googleapis.com')) {
      try { await deleteObject(ref(storage, url)); } catch { /* already gone */ }
    }
  }
  await deleteDoc(doc(db, path(uid), pid));
};

// ── Image Upload: convert → WebP then push to Firebase Storage ──────────────
export const uploadProductImage = async (uid: string, file: File, pid = 'temp'): Promise<string> => {
  const blob      = await toWebP(file, 0.82, 1200);
  const storageRef = ref(storage, `users/${uid}/products/${pid}/${Date.now()}.webp`);
  await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
  return getDownloadURL(storageRef);
};

const toWebP = (file: File, quality: number, maxW: number): Promise<Blob> =>
  new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(img.src);
      c.toBlob((b) => b ? res(b) : rej(new Error('toBlob failed')), 'image/webp', quality);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
