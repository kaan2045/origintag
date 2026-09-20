'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Görünür alana girince bir kez yumuşakça belirir (opacity + hafif yukarı kayma). */
export default function Belir({
    children,
    gecikme = 0,
    mesafe = 18,
    style,
    className,
}: {
    children: ReactNode;
    gecikme?: number;
    mesafe?: number;
    style?: CSSProperties;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [gorunur, setGorunur] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setGorunur(true);
                    io.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: gorunur ? 1 : 0,
                transform: gorunur ? 'translateY(0)' : `translateY(${mesafe}px)`,
                transition: `opacity 900ms var(--ease-out-expo) ${gecikme}ms, transform 1100ms var(--ease-out-expo) ${gecikme}ms`,
                willChange: 'opacity, transform',
                ...style,
            }}
        >
            {children}
        </div>
    );
}
