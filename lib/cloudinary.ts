/**
 * Cloudinary upload helper — uses UNSIGNED upload preset.
 *
 * Unsigned uploads are permanent and don't require a backend signature.
 * The upload preset is created in Cloudinary Dashboard → Settings → Upload → Upload Presets.
 * Set it to "Unsigned" and folder "stockhold".
 *
 * Required env var:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
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
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }

      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(img.src);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob returned null'))),
        'image/webp',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Missing Cloudinary config. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables.'
    );
  }

  // Convert to WebP
  let blob: Blob;
  try {
    blob = await toWebP(file);
  } catch (e) {
    console.warn('WebP conversion failed, uploading original:', e);
    blob = file;
  }

  // Build form — unsigned upload only needs cloud_name + upload_preset
  const form = new FormData();
  form.append('file',          blob,         'image.webp');
  form.append('upload_preset', uploadPreset);
  form.append('folder',        'stockhold');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );

  if (!res.ok) {
    let msg = `Cloudinary upload failed (HTTP ${res.status})`;
    try {
      const body = await res.json();
      msg = body.error?.message || msg;
      console.error('Cloudinary error:', body);
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  const data = await res.json() as { secure_url?: string };

  if (!data.secure_url) {
    console.error('Cloudinary response:', data);
    throw new Error('Cloudinary did not return an image URL');
  }

  // This is a permanent URL — safe to store in Firestore forever
  return data.secure_url;
}
