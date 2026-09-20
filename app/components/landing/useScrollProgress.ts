'use client';
import { useEffect, useState, type RefObject } from 'react';

/**
 * Bir elemanın kaydırma ilerlemesini 0..1 arasında verir.
 * "pin": eleman viewport'tan uzun, içinde sabit (sticky) bir sahne var —
 *        üst kenar viewport'un üstüne değince 0, alt kenar viewport'un altına değince 1.
 * "pass": eleman alttan girerken 0, üstten çıkarken 1.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, mode: 'pin' | 'pass' = 'pin') {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let raf = 0;
        let bekliyor = false;

        const hesapla = () => {
            bekliyor = false;
            const r = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const p = mode === 'pin'
                ? (r.height - vh > 0 ? -r.top / (r.height - vh) : 0)
                : (vh - r.top) / (vh + r.height);
            setProgress(Math.min(1, Math.max(0, p)));
        };
        const onScroll = () => {
            if (bekliyor) return;
            bekliyor = true;
            raf = requestAnimationFrame(hesapla);
        };

        hesapla();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [ref, mode]);

    return progress;
}
