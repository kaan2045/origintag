'use client';
import { useEffect, useState } from 'react';

/**
 * Tüm videoları aynı anda arka planda oynatır, sadece görünürlüğü (opacity)
 * değiştirerek aralarında geçiş yapar. Bu sayede geçiş anında siyah flaş veya
 * kesinti olmaz — tamamen yumuşak crossfade.
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

    useEffect(() => {
        if (videos.length <= 1) return;
        const zamanlayici = setInterval(() => {
            setIndex(i => {
                const sonraki = (i + 1) % videos.length;
                onIndexChange?.(sonraki);
                return sonraki;
            });
        }, intervalMs);
        return () => clearInterval(zamanlayici);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videos.length, intervalMs]);

    return (
        <>
            {videos.map((v, i) => (
                <video
                    key={v}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                        opacity: i === index ? 1 : 0,
                        transition: 'opacity 1.6s ease',
                    }}
                >
                    <source src={v} type="video/mp4" />
                </video>
            ))}
        </>
    );
}
