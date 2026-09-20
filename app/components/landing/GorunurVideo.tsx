'use client';
import { useEffect, useRef, type CSSProperties } from 'react';

/** Sadece görünür alandayken (ya da `aktif` true iken) oynayan sessiz döngü videosu. */
export default function GorunurVideo({ src, aktif, style }: { src: string; aktif?: boolean; style?: CSSProperties }) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        if (aktif === undefined) {
            const io = new IntersectionObserver(([e]) => {
                if (e.isIntersecting) v.play().catch(() => { });
                else v.pause();
            }, { threshold: 0.25 });
            io.observe(v);
            return () => io.disconnect();
        }
        if (aktif) v.play().catch(() => { });
        else v.pause();
    }, [aktif]);

    return (
        <video
            ref={ref}
            muted
            loop
            playsInline
            preload="metadata"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }}
        >
            <source src={src} type="video/mp4" />
        </video>
    );
}
