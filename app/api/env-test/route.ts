import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
    // Tüm process.env içeriğini olduğu gibi say (değerleri gösterme, sadece anahtar isimleri)
    const allKeys = Object.keys(process.env);

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        total_keys: allKeys.length,
        has_cloudinary_cloud_name: 'CLOUDINARY_CLOUD_NAME' in process.env,
        has_cloudinary_api_key: 'CLOUDINARY_API_KEY' in process.env,
        has_cloudinary_api_secret: 'CLOUDINARY_API_SECRET' in process.env,
        has_database_url: 'DATABASE_URL' in process.env,
        first_10_keys: allKeys.slice(0, 10),
        keys_with_cloud_or_CLOUD: allKeys.filter(k => /cloud/i.test(k)),
    }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
}