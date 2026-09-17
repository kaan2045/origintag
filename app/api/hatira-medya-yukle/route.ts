import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * hatira-medya-yukle, medya-yukle'den bilinclі olarak ayri tutuluyor: misafirlerin
 * (ör. Okan & Ayse) OriginTag hesabi yok, o yuzden istekOturumIdAl ile korunamaz.
 * Guvenlik onlemi: token sadece GERCEKTEN VAR OLAN bir pasaportId icin uretilir --
 * genel/anonim bir yukleme deligi degil, tek bir dar senaryo icin acilmis bir kapi.
 */
export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                let pasaportId: string | undefined;
                try {
                    pasaportId = clientPayload ? JSON.parse(clientPayload).pasaportId : undefined;
                } catch {
                    // clientPayload gecersizse asagida pasaportId undefined kalir, reddedilir
                }
                if (!pasaportId) {
                    throw new Error('pasaportId gerekli');
                }
                const pasaportVarMi = await pool.query(
                    `SELECT 1 FROM seyahat_pasaportlari WHERE pasaport_id = $1`,
                    [pasaportId]
                );
                if (pasaportVarMi.rows.length === 0) {
                    throw new Error('Pasaport bulunamadi');
                }

                return {
                    allowedContentTypes: [
                        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                        'video/mp4', 'video/quicktime',
                    ],
                    addRandomSuffix: false,
                    maximumSizeInBytes: 50 * 1024 * 1024,
                };
            },
            onUploadCompleted: async () => {
                // Localhost'ta tetiklenmez; prod'da dosya Blob'a yazildiktan sonra cagrilir.
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (err: unknown) {
        console.error('hatira-medya-yukle hatasi:', err);
        return NextResponse.json({ error: 'Yukleme basarisiz, lutfen tekrar deneyin' }, { status: 400 });
    }
}
