'use client';
import { useEffect, useState } from 'react';

/**
 * Basit video döngüsü: tek bir <video> elementi kullanır, belirli aralıklarla
 * kaynağını (src) değiştirir. Geçiş anında kısa bir opacity fade uygulanır.
 * Önceki sürümde tüm videolar aynı anda arka planda oynatılıyordu (gerçek
 * crossfade için) ama bu daha ağır ve karmaşıktı — bu sürüm tek seferde
 * sadece bir video oynatır, çok daha hafif ve basit.
 */
export default function VideoKatmanlari({
    videos,
    intervalMs = 8000,
    onIndexChange,
}: {
    videos: string[];
    intervalMs?: number;
    onIndexChange?: (index: number) => void;
}) {
    const [index, setIndex] = useState(0);
    const [sonuk, setSonuk] = useState(false);

    useEffect(() => {
        if (videos.length <= 1) return;
        const zamanlayici = setInterval(() => {
            setSonuk(true);
            setTimeout(() => {
                setIndex(i => {
                    const sonraki = (i + 1) % videos.length;
                    onIndexChange?.(sonraki);
                    return sonraki;
                });
                setSonuk(false);
            }, 400);
        }, intervalMs);
        return () => clearInterval(zamanlayici);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videos.length, intervalMs]);

    return (
        <video
            key={videos[index]}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: sonuk ? 0 : 1,
                transition: 'opacity 0.4s ease',
            }}
        >
            <source src={videos[index]} type="video/mp4" />
        </video>
    );
}
