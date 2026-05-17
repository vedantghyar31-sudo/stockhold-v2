import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, orderBy, serverTimestamp, where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
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
  if (!barcode.trim()) return null;
  const snap = await getDocs(
    query(collection(db, path(uid)), where('barcode', '==', barcode.trim()))
  );
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Product;
};

export const addProduct = async (
  uid: string,
  data: Omit<Product, 'id' | 'createdAt' | 'userId'>
): Promise<string> => {
  const r = await addDoc(collection(db, path(uid)), {
    ...data,
    userId:    uid,
    createdAt: serverTimestamp(),
  });
  return r.id;
};

export const updateProduct = async (
  uid: string,
  pid: string,
  data: Partial<Omit<Product, 'id' | 'createdAt' | 'userId'>>
): Promise<void> => {
  await updateDoc(doc(db, path(uid), pid), data as Record<string, unknown>);
};

export const deleteProduct = async (uid: string, pid: string): Promise<void> => {
  await deleteDoc(doc(db, path(uid), pid));
};

/**
 * Upload product image to Cloudinary, return the secure URL.
 */
export const uploadProductImage = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, 'stockhold/products');
};
