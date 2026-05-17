import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { ShopProfile } from '@/types';

const path = (uid: string) => `users/${uid}/profile/info`;

export const getProfile = async (uid: string): Promise<ShopProfile | null> => {
  const snap = await getDoc(doc(db, path(uid)));
  return snap.exists() ? (snap.data() as ShopProfile) : null;
};

export const saveProfile = async (uid: string, data: Partial<ShopProfile>): Promise<void> =>
  setDoc(doc(db, path(uid)), data, { merge: true });

/**
 * Upload shop logo to Cloudinary and return the secure URL.
 */
export const uploadLogo = async (_uid: string, file: File): Promise<string> => {
  return uploadToCloudinary(file, 'stockhold/logos');
};

/**
 * Remove logo URL from Firestore (Cloudinary asset kept for now).
 */
export const deleteLogo = async (uid: string): Promise<void> => {
  await saveProfile(uid, { shopLogo: '' });
};
