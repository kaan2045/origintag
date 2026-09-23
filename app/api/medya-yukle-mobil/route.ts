import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { istekOturumIdAl } from '../../lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IZINLI_TIPLER = ['image/jpeg', 'image/png', 'image/webp'];
// Vercel serverless istek govdesi ~4.5 MB ile sinirli; mobil zaten sikistirip gonderiyor.
const MAKS_BOYUT = 4 * 1024 * 1024;

/**
 * Mobil (React Native) icin dogrudan yukleme.
 *
 * medya-yukle rotasi tarayici icin tasarlanmis "client token" akisini (@vercel/blob/client)
 * kullaniyor; o paket Node'un crypto/undici modullerine dayandigi icin React Native'de
 * calismaz. Burada dosyayi sunucu alip Blob'a kendisi yaziyor -- mobil tarafta ek bir
 * bagimlilik ve protokol eslesmesi gerekmiyor.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    const kullaniciId = istekOturumIdAl(request);
    if (!kullaniciId) {
        return NextResponse.json({ basari: false, hata: 'Oturum gecersiz, lutfen tekrar giris yapin' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!IZINLI_TIPLER.includes(contentType)) {
        return NextResponse.json({ basari: false, hata: 'Desteklenmeyen dosya turu' }, { status: 400 });
    }

    const dosyaAdi = request.nextUrl.searchParams.get('ad') || 'foto.jpg';
    // Yol enjeksiyonunu engelle: sadece dosya adinin guvenli karakterleri kalsin.
    const guvenliAd = dosyaAdi.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-60);

    const veri = await request.arrayBuffer();
    if (veri.byteLength === 0) {
        return NextResponse.json({ basari: false, hata: 'Bos dosya' }, { status: 400 });
    }
    if (veri.byteLength > MAKS_BOYUT) {
        return NextResponse.json({ basari: false, hata: 'Dosya cok buyuk (en fazla 4 MB)' }, { status: 413 });
    }

    try {
        const blob = await put(`urunler/${kullaniciId}/${Date.now()}-${guvenliAd}`, veri, {
            access: 'public',
            contentType,
            addRandomSuffix: false,
        });
        return NextResponse.json({ basari: true, url: blob.url });
    } catch (err) {
        console.error('medya-yukle-mobil hatasi:', err);
        return NextResponse.json({ basari: false, hata: 'Yukleme basarisiz, lutfen tekrar deneyin' }, { status: 500 });
    }
}
