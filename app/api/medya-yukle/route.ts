import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const dosyalar = formData.getAll('dosyalar') as File[];

        if (!dosyalar || dosyalar.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Dosya bulunamadi' }, { status: 400 });
        }

        const yuklenenUrller: string[] = [];

        for (const dosya of dosyalar) {
            const dosyaAdi = `urunler/${Date.now()}-${Math.random().toString(36).slice(2)}-${dosya.name}`;

            const blob = await put(dosyaAdi, dosya, {
                access: 'public',
                addRandomSuffix: false,
            });

            yuklenenUrller.push(blob.url);
        }

        return NextResponse.json({ basari: true, urls: yuklenenUrller });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}