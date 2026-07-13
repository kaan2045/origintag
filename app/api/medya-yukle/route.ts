import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => ({
                allowedContentTypes: [
                    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                    'video/mp4', 'video/quicktime',
                ],
                addRandomSuffix: false,
                maximumSizeInBytes: 50 * 1024 * 1024,
            }),
            onUploadCompleted: async () => {
                // Localhost'ta tetiklenmez (public URL gerektirir); prod'da dosya Blob'a
                // yazildiktan sonra cagrilir. Su an ek bir islem gerekmiyor.
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
