import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { sessionDogrula, COOKIE_ADI } from '../../lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
    const kullaniciId = sessionDogrula(request.cookies.get(COOKIE_ADI)?.value);
    if (!kullaniciId) {
        return NextResponse.json({ error: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
    }

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
        console.error('medya-yukle hatasi:', err);
        return NextResponse.json({ error: 'Yukleme basarisiz, lutfen tekrar deneyin' }, { status: 400 });
    }
}
