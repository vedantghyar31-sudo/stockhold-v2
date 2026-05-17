import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary environment variables not configured' },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder    = 'stockhold';

  // Build the string to sign: params sorted alphabetically
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature    = crypto
    .createHash('sha256')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  });
}
