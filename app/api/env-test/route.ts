import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || null,
        api_key: process.env.CLOUDINARY_API_KEY || null,
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : null,
        database_url: process.env.DATABASE_URL ? 'SET' : null,
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV || null,
        all_keys_count: Object.keys(process.env).length,
        cloud_keys: Object.keys(process.env).filter(k => k.toLowerCase().includes('cloud')),
    });
}