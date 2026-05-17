import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Missing Cloudinary env vars:', {
      cloudName: !!cloudName,
      apiKey:    !!apiKey,
      apiSecret: !!apiSecret,
    });
    return NextResponse.json(
      { error: 'Cloudinary not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.' },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder    = 'stockhold';

  // Cloudinary signature: SHA-256 of "folder=X&timestamp=Y" + apiSecret
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature    = crypto
    .createHash('sha256')
    .update(stringToSign)
    .digest('hex');

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  });
}
