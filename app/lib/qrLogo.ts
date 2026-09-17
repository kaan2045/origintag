import QRCode from 'qrcode';

const LOGO_URL = '/origin.png';

function logoYukle(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = LOGO_URL;
    });
}

async function logoyuOrtayaCiz(ctx: CanvasRenderingContext2D, boyut: number) {
    const logo = await logoYukle();
    // QR'in ~%22'si -- H (yuksek) hata duzeltme seviyesinde %30'a kadar kapatma guvenli,
    // %22 hem tarama guvenilirligini korur hem logoyu net gosterir.
    const logoBoyut = boyut * 0.22;
    const merkezX = boyut / 2;
    const merkezY = boyut / 2;

    // Beyaz yuvarlak fon: QR modullerinin ustunde kontrast ve net kenar saglar
    const fonYaricap = logoBoyut / 2 + boyut * 0.025;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(merkezX, merkezY, fonYaricap, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(logo, merkezX - logoBoyut / 2, merkezY - logoBoyut / 2, logoBoyut, logoBoyut);
}

interface QrRenkler {
    dark: string;
    light: string;
}

/**
 * Verilen canvas'a, ortasinda OriginTag logosu olan taranabilir bir QR cizer.
 * Hata duzeltme seviyesi kasitli olarak 'H' -- logo merkezi kapatsa da QR
 * okunabilirligini korur. Indirilen/paylasilan her QR icin kullanilmali.
 */
export async function logoluQrCiz(
    canvas: HTMLCanvasElement,
    url: string,
    boyut: number,
    renkler: QrRenkler = { dark: '#101415', light: '#ffffff' }
): Promise<void> {
    await QRCode.toCanvas(canvas, url, {
        width: boyut,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: renkler,
    });
    const ctx = canvas.getContext('2d');
    if (ctx) await logoyuOrtayaCiz(ctx, boyut);
}

/** PDF gömme veya <img src> gibi data URL gereken yerler icin. */
export async function logoluQrDataUrlUret(
    url: string,
    boyut: number,
    renkler: QrRenkler = { dark: '#101415', light: '#ffffff' }
): Promise<string> {
    const canvas = document.createElement('canvas');
    await logoluQrCiz(canvas, url, boyut, renkler);
    return canvas.toDataURL('image/png');
}
