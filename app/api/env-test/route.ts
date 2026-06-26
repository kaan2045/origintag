import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
    const allKeys = Object.keys(process.env);

    return new NextResponse(JSON.stringify({
        timestamp: new Date().toISOString(),
        random: Math.random(),
        total_keys: allKeys.length,
        has_cloudinary_cloud_name: 'CLOUDINARY_CLOUD_NAME' in process.env,
        has_cloudinary_api_key: 'CLOUDINARY_API_KEY' in process.env,
        has_cloudinary_api_secret: 'CLOUDINARY_API_SECRET' in process.env,
        has_database_url: 'DATABASE_URL' in process.env,
        has_blob_token: 'BLOB_READ_WRITE_TOKEN' in process.env,
        has_blob_store_id: 'BLOB_STORE_ID' in process.env,
        keys_with_blob: allKeys.filter(k => /blob/i.test(k)),
        keys_with_cloud: allKeys.filter(k => /cloud/i.test(k)),
    }, null, 2), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
}