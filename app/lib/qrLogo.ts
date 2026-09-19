import QRCode from 'qrcode';

interface QrRenkler {
    dark: string;
    light: string;
}

/** Duz QR uretir -- logo QR'in icine gomulmez, ayri bir gorsel olarak ustune konur. */
export async function qrCiz(
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
}

/** PDF gömme veya <img src> gibi data URL gereken yerler icin. */
export async function qrDataUrlUret(
    url: string,
    boyut: number,
    renkler: QrRenkler = { dark: '#101415', light: '#ffffff' }
): Promise<string> {
    return QRCode.toDataURL(url, {
        width: boyut,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: renkler,
    });
}
