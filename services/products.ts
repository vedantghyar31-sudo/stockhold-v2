import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

export interface ProductInput {
  name: string;
  barcode?: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  imageUrl?: string;
}

const PRODUCTS = 'products';

async function toWebP(
  file: File,
  quality = 0.82,
  maxSize = 1200
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);

  const scale = Math.min(
    1,
    maxSize / Math.max(imageBitmap.width, imageBitmap.height)
  );

  const width = Math.round(imageBitmap.width * scale);
  const height = Math.round(imageBitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('WebP conversion failed'));
      },
      'image/webp',
      quality
    );
  });
}

export const uploadProductImage = async (
  uid: string,
  file: File
): Promise<string> => {
  const blob = await toWebP(file, 0.82, 1200);

  const formData = new FormData();

  formData.append(
    'file',
    new File([blob], 'product.webp', {
      type: 'image/webp',
    })
  );

  formData.append(
    'upload_preset',
    process.env['NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'] || ''
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${
      process.env['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME']
    }/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (!data.secure_url) {
    console.error(data);
    throw new Error('Cloudinary upload failed');
  }

  return data.secure_url;
};

export const addProduct = async (
  uid: string,
  product: ProductInput
) => {
  return addDoc(collection(db, PRODUCTS), {
    ...product,
    uid,
    createdAt: serverTimestamp(),
  });
};

export const updateProduct = async (
  productId: string,
  product: Partial<ProductInput>
) => {
  const productRef = doc(db, PRODUCTS, productId);

  return updateDoc(productRef, product);
};

export const deleteProduct = async (productId: string) => {
  return deleteDoc(doc(db, PRODUCTS, productId));
};

export const getProducts = async (uid: string) => {
  const q = query(
    collection(db, PRODUCTS),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap: any) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

export const getProduct = async (productId: string) => {
  const snap = await getDoc(doc(db, PRODUCTS, productId));

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
};