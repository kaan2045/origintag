'use client';
import { useEffect, useState } from 'react';

/**
 * Birden fazla video arasında belirli aralıklarla geçiş yapar (crossfade).
 * Tek video verilirse rotasyon yapmaz, sadece döngüde oynatır.
 */
export function useVideoRotasyonu(videos: string[], intervalMs = 8000) {
    const [index, setIndex] = useState(0);
    const [sonuyor, setSonuyor] = useState(false);

    useEffect(() => {
        if (videos.length <= 1) return;
        const zamanlayici = setInterval(() => {
            setSonuyor(true);
            setTimeout(() => {
                setIndex(i => (i + 1) % videos.length);
                setSonuyor(false);
            }, 500);
        }, intervalMs);
        return () => clearInterval(zamanlayici);
    }, [videos.length, intervalMs]);

    return { src: videos[index], index, sonuyor };
}
