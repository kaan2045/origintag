'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * QR kodu 4 yüzlü, kendi ekseninde dönen bir küp olarak gösterir
 * (Clodia'daki floating QR küp referansına benzer).
 */
export default function QRKup({ url, boyut = 150 }: { url: string; boyut?: number }) {
    const [dataUrl, setDataUrl] = useState<string | null>(null);

    useEffect(() => {
        QRCode.toDataURL(url, {
            width: boyut * 2, margin: 1,
            color: { dark: '#23261e', light: '#ffffff' },
        }).then(setDataUrl);
    }, [url, boyut]);

    const yariBoyut = boyut / 2;
    const yuzOrtak: React.CSSProperties = {
        position: 'absolute',
        width: boyut,
        height: boyut,
        backgroundImage: dataUrl ? `url(${dataUrl})` : undefined,
        backgroundColor: '#fff',
        backgroundSize: 'cover',
        border: '5px solid #fff',
        boxShadow: '0 0 24px rgba(0,0,0,0.25)',
    };

    return (
        <div style={{ perspective: '900px', width: boyut, height: boyut }}>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    animation: 'origintag-kup-don 10s linear infinite',
                }}
            >
                <div style={{ ...yuzOrtak, transform: `translateZ(${yariBoyut}px)` }} />
                <div style={{ ...yuzOrtak, transform: `rotateY(180deg) translateZ(${yariBoyut}px)` }} />
                <div style={{ ...yuzOrtak, transform: `rotateY(90deg) translateZ(${yariBoyut}px)` }} />
                <div style={{ ...yuzOrtak, transform: `rotateY(-90deg) translateZ(${yariBoyut}px)` }} />
            </div>
            <style>{`
                @keyframes origintag-kup-don {
                    from { transform: rotateY(0deg); }
                    to { transform: rotateY(360deg); }
                }
                @media (prefers-reduced-motion: reduce) {
                    div[style*="origintag-kup-don"] { animation: none !important; }
                }
            `}</style>
        </div>
    );
}
