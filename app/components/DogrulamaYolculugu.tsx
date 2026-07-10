'use client';

interface YolculukAdimi {
    etiket: string;
    tarih: string;
    aktif?: boolean;
}

export default function DogrulamaYolculugu({ adimlar, accentColor }: { adimlar: YolculukAdimi[]; accentColor: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', padding: '0 4px' }}>
            <div style={{
                position: 'absolute', top: '7px', left: '5%', right: '5%', height: '1px',
                background: `repeating-linear-gradient(to right, ${accentColor} 0 6px, transparent 6px 12px)`,
                opacity: 0.55,
            }} />
            {adimlar.map((adim, i) => (
                <div key={i} style={{ flex: 1, textAlign: i === 0 ? 'left' : i === adimlar.length - 1 ? 'right' : 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: i === 0 ? 'flex-start' : i === adimlar.length - 1 ? 'flex-end' : 'center',
                    }}>
                        <div style={{
                            width: '15px', height: '15px', borderRadius: '50%',
                            background: adim.aktif ? accentColor : 'var(--parchment)',
                            border: `2px solid ${accentColor}`,
                        }} />
                    </div>
                    <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8a8377' }}>
                        {adim.etiket}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>
                        {adim.tarih}
                    </div>
                </div>
            ))}
        </div>
    );
}
