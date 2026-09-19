import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { qrDataUrlUret } from './qrLogo';

export interface PasaportKartVerisi {
    pasaportId: string;
    misafirAdi: string;
    destinasyon: string;
    ulke: string;
    girisTarihi?: string | null;
    cikisTarihi?: string | null;
    kapakGorselUrl?: string | null;
}

function tarihAraligi(giris?: string | null, cikis?: string | null): string {
    if (!giris || !cikis) return '';
    const g = new Date(giris);
    const c = new Date(cikis);
    const ay = c.toLocaleDateString('en-US', { month: 'long' });
    return `${g.getDate()}–${c.getDate()} ${ay} ${c.getFullYear()}`;
}

// Kart, ekranda 10px/mm olcekte insa edilir (85.6x54mm -> 856x540px), html2canvas
// scale:2 ile rasterize eder -- baski/QR-tarama icin yeterli netlik.
const GENISLIK = 856;
const YUKSEKLIK = 540;

const KAPAK_SVG = `
<svg viewBox="0 0 856 540" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;">
  <defs>
    <linearGradient id="gky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffb27a" />
      <stop offset="55%" stop-color="#c96b4a" />
      <stop offset="100%" stop-color="#2a1a1f" />
    </linearGradient>
  </defs>
  <rect width="856" height="540" fill="url(#gky)" />
  ${[60, 160, 260, 560, 660, 760].map((x, i) => `<path d="M${x},480 L${x + 20},${330 - (i % 3) * 22} Q${x + 27},${308 - (i % 3) * 22} ${x + 34},${330 - (i % 3) * 22} L${x + 54},480 Z" fill="#241318" opacity="0.88" />`).join('')}
  <ellipse cx="240" cy="160" rx="36" ry="44" fill="#b2e630" opacity="0.9" />
  <ellipse cx="370" cy="100" rx="27" ry="34" fill="#f5efe0" opacity="0.85" />
  <ellipse cx="510" cy="170" rx="32" ry="40" fill="#a9cfc0" opacity="0.88" />
  <ellipse cx="640" cy="110" rx="23" ry="29" fill="#ffdf9e" opacity="0.85" />
</svg>`;

function onYuzDomOlustur(veri: PasaportKartVerisi): HTMLDivElement {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed; left:-9999px; top:0; width:${GENISLIK}px; height:${YUKSEKLIK}px; overflow:hidden; border-radius:28px; font-family: var(--font-body, sans-serif);`;

    const arkaPlan = veri.kapakGorselUrl
        ? `<img src="${veri.kapakGorselUrl}" crossorigin="anonymous" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />`
        : KAPAK_SVG;

    div.innerHTML = `
      ${arkaPlan}
      <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(10,6,8,0.15) 0%, rgba(10,6,8,0.15) 40%, rgba(10,6,8,0.92) 100%);"></div>
      <div style="position:absolute; top:28px; left:32px; display:flex; align-items:center; gap:8px;">
        <img src="/origin.png" style="height:26px; filter:brightness(0) invert(1);" />
        <span style="font-family: var(--font-display, sans-serif); font-weight:700; font-size:15px; color:#fff; letter-spacing:0.01em;">OriginTag <span style="color:#d9a86c;">Memories</span></span>
      </div>
      <div style="position:absolute; top:60px; left:33px; font-size:9px; letter-spacing:0.18em; color:rgba(255,255,255,0.7); text-transform:uppercase;">Digital Travel Passport</div>

      <div style="position:absolute; top:150px; left:33px; font-family: var(--font-display, sans-serif); font-style:italic; font-size:15px; line-height:1.5; color:#f2ead9; font-weight:500;">
        Real Places<br/>Real Moments<br/>Always Yours
      </div>

      <div style="position:absolute; bottom:26px; left:33px; right:33px; display:flex; justify-content:space-between; align-items:flex-end;">
        <div>
          <div style="font-family: var(--font-display, sans-serif); font-weight:800; font-size:30px; color:#fff; letter-spacing:-0.01em; line-height:1.05;">MY ${veri.destinasyon.toUpperCase()}</div>
          <div style="font-size:16px; color:#f2ead9; margin-top:6px; font-weight:600;">${veri.misafirAdi}</div>
          <div style="font-size:11px; color:rgba(255,255,255,0.7); margin-top:4px;">${tarihAraligi(veri.girisTarihi, veri.cikisTarihi)}</div>
        </div>
        <div style="text-align:right; border-left:1px solid rgba(255,255,255,0.25); padding-left:14px;">
          <div style="font-size:8px; letter-spacing:0.1em; color:rgba(255,255,255,0.55); text-transform:uppercase;">Passport No.</div>
          <div style="font-size:11px; color:#f2ead9; font-weight:600; margin-top:2px;">${veri.pasaportId}</div>
        </div>
      </div>
    `;
    return div;
}

function arkaYuzDomOlustur(veri: PasaportKartVerisi, qrDataUrl: string): HTMLDivElement {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed; left:-9999px; top:0; width:${GENISLIK}px; height:${YUKSEKLIK}px; overflow:hidden; border-radius:28px; background:#f2ead9; font-family: var(--font-body, sans-serif); position:relative;`;

    div.innerHTML = `
      <div style="position:absolute; top:38px; left:36px; max-width:220px;">
        <div style="font-size:12px; letter-spacing:0.08em; color:#3a2a1f; text-transform:uppercase; font-weight:700; line-height:1.6;">A Small Card<br/>For A Bigger Story</div>
        <div style="width:36px; height:2px; background:#c9974f; margin-top:12px;"></div>
      </div>

      <svg viewBox="0 0 200 140" style="position:absolute; bottom:60px; left:30px; width:180px; height:126px; opacity:0.55;">
        <g fill="none" stroke="#6b5946" stroke-width="1.6">
          <path d="M10,130 L45,45 L60,70 L75,30 L95,130 Z" />
          <path d="M100,130 L130,60 L150,95 L165,50 L180,130 Z" />
        </g>
      </svg>

      <div style="position:absolute; top:44px; right:44px; text-align:center;">
        <div style="background:#fff; padding:14px; border-radius:14px; box-shadow:0 6px 18px rgba(0,0,0,0.12); display:inline-block;">
          <img src="${qrDataUrl}" style="width:200px; height:200px; display:block;" />
        </div>
        <div style="font-size:13px; font-weight:700; color:#3a2a1f; margin-top:14px;">Scan to relive your journey</div>
      </div>

      <div style="position:absolute; bottom:24px; left:36px; display:flex; align-items:center; gap:6px; font-size:11px; color:#6b5946;">
        <span>🌱</span><span>Powered by <strong>OriginTag</strong></span>
      </div>
      <div style="position:absolute; bottom:24px; right:44px; font-size:11px; color:#6b5946;">origintag.com.tr</div>
    `;
    return div;
}

/** Kredi karti boyutunda (ISO/IEC 7810 ID-1, 85.6x54mm) on/arka PDF hatira karti uretir. */
export async function pasaportKartiIndir(veri: PasaportKartVerisi) {
    const qrDataUrl = await qrDataUrlUret(`https://origintag.com.tr/memory/${veri.pasaportId}`, 400, {
        dark: '#1f1611',
        light: '#ffffff',
    });

    const onDiv = onYuzDomOlustur(veri);
    const arkaDiv = arkaYuzDomOlustur(veri, qrDataUrl);
    document.body.appendChild(onDiv);
    document.body.appendChild(arkaDiv);

    try {
        // Resimlerin (kapak fotografi, logo) tamamen yuklenmesini bekle
        const tumResimler = [...onDiv.querySelectorAll('img'), ...arkaDiv.querySelectorAll('img')];
        await Promise.all(
            tumResimler.map(
                (img) =>
                    new Promise<void>((resolve) => {
                        if (img.complete) return resolve();
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                    })
            )
        );

        const [onCanvas, arkaCanvas] = await Promise.all([
            html2canvas(onDiv, { scale: 2, useCORS: true, backgroundColor: null }),
            html2canvas(arkaDiv, { scale: 2, useCORS: true, backgroundColor: '#f2ead9' }),
        ]);

        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
        pdf.addImage(onCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 85.6, 54);
        pdf.addPage([85.6, 54], 'landscape');
        pdf.addImage(arkaCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 85.6, 54);
        pdf.save(`${veri.pasaportId}-memory-card.pdf`);
    } finally {
        document.body.removeChild(onDiv);
        document.body.removeChild(arkaDiv);
    }
}
