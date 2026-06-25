import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
    const envDebug = {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '***SET***' : undefined,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('CLOUD')),
    };

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return NextResponse.json({
            basari: false,
            hata: 'Cloudinary env eksik',
            debug: envDebug
        }, { status: 500 });
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        const formData = await req.formData();
        const dosyalar = formData.getAll('dosyalar') as File[];

        if (!dosyalar || dosyalar.length === 0) {
            return NextResponse.json({ basari: false, hata: 'Dosya bulunamadi' }, { status: 400 });
        }

        const yuklenenUrller: string[] = [];

        for (const dosya of dosyalar) {
            const bytes = await dosya.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString('base64');
            const dataUri = `data:${dosya.type};base64,${base64}`;
            const isVideo = dosya.type.startsWith('video/');

            const sonuc = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload(
                    dataUri,
                    {
                        folder: 'origintag/urunler',
                        resource_type: isVideo ? 'video' : 'image',
                        transformation: isVideo
                            ? [{ quality: 'auto', fetch_format: 'auto' }]
                            : [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
                    },
                    (error: unknown, result: unknown) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });

            yuklenenUrller.push((sonuc as any).secure_url);
        }

        return NextResponse.json({ basari: true, urls: yuklenenUrller });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        return NextResponse.json({ basari: false, hata: message }, { status: 500 });
    }
}