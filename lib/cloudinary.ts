/**
 * Cloudinary upload helper — used for product images and shop logo.
 * Fetches a secure signature from /api/cloudinary-sign (keeps secret off client).
 */

interface CloudinaryResponse {
  secure_url: string;
  public_id:  string;
}

/**
 * Convert any image File to WebP Blob using canvas (client-side, no dep).
 */
const toWebP = (file: File, quality = 0.85, maxW = 1200): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(img.src);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
        'image/webp',
        quality
      );
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });

/**
 * Upload a File to Cloudinary.
 * @param file  The image file chosen by the user
 * @param folder Override subfolder (default: 'stockhold')
 */
export async function uploadToCloudinary(file: File, folder?: string): Promise<string> {
  // 1. Get signed params from our backend
  const sigRes = await fetch('/api/cloudinary-sign');
  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get upload signature');
  }
  const { signature, timestamp, apiKey, cloudName, folder: defaultFolder } = await sigRes.json();

  // 2. Convert to WebP
  const blob = await toWebP(file);

  // 3. Build FormData for Cloudinary upload API
  const formData = new FormData();
  formData.append('file',       blob,                       'image.webp');
  formData.append('api_key',    apiKey);
  formData.append('timestamp',  String(timestamp));
  formData.append('signature',  signature);
  formData.append('folder',     folder ?? defaultFolder);

  // 4. POST to Cloudinary
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Cloudinary upload failed');
  }

  const data: CloudinaryResponse = await uploadRes.json();
  return data.secure_url;
}
