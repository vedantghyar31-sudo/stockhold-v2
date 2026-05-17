/**
 * Cloudinary upload helper.
 * Fetches a secure signature from /api/cloudinary-sign (keeps API secret off client).
 * Converts image to WebP before uploading.
 */

/**
 * Convert any image File to a compressed WebP Blob using canvas.
 */
const toWebP = (file: File, quality = 0.85, maxW = 1200): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not available')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(img.src);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
        'image/webp',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = URL.createObjectURL(file);
  });

/**
 * Upload a File to Cloudinary.
 * Returns the secure_url of the uploaded image.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  // 1. Get signed params from our secure backend route
  const sigRes = await fetch('/api/cloudinary-sign');

  if (!sigRes.ok) {
    let errMsg = 'Failed to get upload signature';
    try {
      const errData = await sigRes.json();
      errMsg = errData.error || errMsg;
    } catch { /* ignore parse error */ }
    throw new Error(errMsg);
  }

  const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

  if (!signature || !timestamp || !apiKey || !cloudName) {
    throw new Error('Invalid signature response from server');
  }

  // 2. Convert to WebP for better compression
  let uploadBlob: Blob;
  try {
    uploadBlob = await toWebP(file);
  } catch (err) {
    console.warn('WebP conversion failed, using original file:', err);
    uploadBlob = file; // fallback to original
  }

  // 3. Build multipart form for Cloudinary
  const form = new FormData();
  form.append('file',      uploadBlob,       'image.webp');
  form.append('api_key',   apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder',    folder);

  // 4. Upload to Cloudinary
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );

  if (!uploadRes.ok) {
    let errMsg = `Cloudinary upload failed (${uploadRes.status})`;
    try {
      const errData = await uploadRes.json();
      errMsg = errData.error?.message || errMsg;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }

  const data = await uploadRes.json();

  if (!data.secure_url) {
    throw new Error('Cloudinary did not return a URL');
  }

  return data.secure_url as string;
}
