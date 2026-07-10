import { UrunTemaAnahtari } from '../lib/urunTema';

/**
 * Ürün tipine özel, sade çizgi-illüstrasyon sahneleri.
 * Renk `currentColor` üzerinden gelir — sarmalayan elemanın `color` stiliyle kontrol edilir.
 * Fotoğraf/telifli görsel kullanılmıyor; tamamen orijinal, tek renkli çizgi çalışması.
 */

function BalSahnesi() {
    return (
        <svg viewBox="0 0 480 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            {/* Petek dokusu - arka plan */}
            <g opacity="0.16" stroke="currentColor" strokeWidth="1.4">
                {[0, 1, 2, 3, 4].map(row =>
                    [0, 1, 2, 3, 4, 5].map(col => {
                        const x = col * 52 + (row % 2 === 0 ? 0 : 26) - 20;
                        const y = row * 46 - 30;
                        return (
                            <polygon
                                key={`${row}-${col}`}
                                points="15,0 45,0 60,26 45,52 15,52 0,26"
                                transform={`translate(${x},${y})`}
                            />
                        );
                    })
                )}
            </g>

            {/* Merkezi petek gözü */}
            <polygon points="240,60 300,95 300,165 240,200 180,165 180,95"
                stroke="currentColor" strokeWidth="2.5" opacity="0.85" />

            {/* Arı */}
            <g transform="translate(216,105)">
                <ellipse cx="24" cy="16" rx="9" ry="6.5" fill="currentColor" opacity="0.5" transform="rotate(-18 24 16)" />
                <ellipse cx="30" cy="10" rx="8" ry="5.5" fill="currentColor" opacity="0.35" transform="rotate(-8 30 10)" />
                <ellipse cx="14" cy="20" rx="12" ry="9" fill="currentColor" />
                <path d="M4 20 Q14 10 26 20 Q14 30 4 20 Z" fill="none" stroke="var(--parchment)" strokeWidth="1.6" opacity="0.7" />
                <line x1="4" y1="12" x2="0" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="8" y1="10" x2="6" y2="3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </g>

            {/* Damlayan bal */}
            <path d="M266 200 C266 214, 258 220, 258 232 C258 240, 264 246, 270 246 C276 246, 282 240, 282 232 C282 220, 274 214, 274 200 Z"
                fill="currentColor" opacity="0.9" />
            <ellipse cx="270" cy="266" rx="20" ry="6" fill="currentColor" opacity="0.3" />
        </svg>
    );
}

function ZeytinSahnesi() {
    return (
        <svg viewBox="0 0 480 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            {/* Zeytin dalı */}
            <path d="M120 70 C200 90, 260 60, 340 90" stroke="currentColor" strokeWidth="2.5" opacity="0.85" strokeLinecap="round" />
            {[
                { x: 150, y: 68, r: -30 },
                { x: 190, y: 78, r: 10 },
                { x: 230, y: 72, r: -20 },
                { x: 270, y: 82, r: 15 },
                { x: 305, y: 84, r: -10 },
            ].map((y, i) => (
                <ellipse key={i} cx={y.x} cy={y.y - 22} rx="9" ry="22"
                    fill="currentColor" opacity="0.5"
                    transform={`rotate(${y.r} ${y.x} ${y.y - 22})`} />
            ))}
            <circle cx="205" cy="98" r="9" fill="currentColor" opacity="0.9" />
            <circle cx="222" cy="108" r="9" fill="currentColor" opacity="0.9" />
            <circle cx="188" cy="110" r="9" fill="currentColor" opacity="0.9" />

            {/* Sıkım akışı */}
            <path d="M240 140 C240 170, 246 190, 246 210" stroke="currentColor" strokeWidth="3" opacity="0.7" strokeLinecap="round" />
            <path d="M246 210 Q246 220, 236 224" stroke="currentColor" strokeWidth="3" opacity="0.7" strokeLinecap="round" fill="none" />

            {/* Kase */}
            <path d="M170 226 Q170 258, 240 258 Q310 258, 310 226" stroke="currentColor" strokeWidth="2.5" opacity="0.85" />
            <ellipse cx="240" cy="226" rx="70" ry="12" stroke="currentColor" strokeWidth="2.5" opacity="0.85" />
            <ellipse cx="240" cy="223" rx="58" ry="7" fill="currentColor" opacity="0.55" />
        </svg>
    );
}

function GenelSahne() {
    return (
        <svg viewBox="0 0 480 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            {/* Başak demeti */}
            {[190, 240, 290].map((x, i) => (
                <g key={i} opacity={i === 1 ? 1 : 0.7}>
                    <line x1={x} y1="230" x2={x - (i - 1) * 14} y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    {Array.from({ length: 7 }).map((_, j) => {
                        const t = j / 6;
                        const yy = 80 + t * 110;
                        const xx = x - (i - 1) * 14 * (1 - t * 0.7);
                        return (
                            <g key={j}>
                                <ellipse cx={xx - 10} cy={yy} rx="7" ry="13" fill="currentColor" opacity="0.6" transform={`rotate(-35 ${xx - 10} ${yy})`} />
                                <ellipse cx={xx + 10} cy={yy} rx="7" ry="13" fill="currentColor" opacity="0.6" transform={`rotate(35 ${xx + 10} ${yy})`} />
                            </g>
                        );
                    })}
                </g>
            ))}
            {/* bağ */}
            <path d="M215 232 Q240 244, 265 232" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        </svg>
    );
}

export default function UrunIllustrasyonu({ tema }: { tema: UrunTemaAnahtari }) {
    if (tema === 'bal') return <BalSahnesi />;
    if (tema === 'zeytinyagi') return <ZeytinSahnesi />;
    return <GenelSahne />;
}
