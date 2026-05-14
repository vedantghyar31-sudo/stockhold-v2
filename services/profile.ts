import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { ShopProfile } from '@/types';

const path = (uid: string) => `users/${uid}/profile/info`;

export const getProfile = async (uid: string): Promise<ShopProfile | null> => {
  const snap = await getDoc(doc(db, path(uid)));
  return snap.exists() ? (snap.data() as ShopProfile) : null;
};

export const saveProfile = async (uid: string, data: Partial<ShopProfile>): Promise<void> =>
  setDoc(doc(db, path(uid)), data, { merge: true });

export const uploadLogo = async (uid: string, file: File): Promise<string> => {
  const blob = await toWebP(file, 0.9, 400);
  const storageRef = ref(storage, `users/${uid}/profile/logo.webp`);
  await uploadBytes(storageRef, blob, { contentType: 'image/webp' });
  return getDownloadURL(storageRef);
};

export const deleteLogo = async (uid: string): Promise<void> => {
  try { await deleteObject(ref(storage, `users/${uid}/profile/logo.webp`)); } catch { /* ok */ }
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
