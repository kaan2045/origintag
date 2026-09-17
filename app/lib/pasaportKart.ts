import QRCode from 'qrcode';
import jsPDF from 'jspdf';

export interface PasaportKartVerisi {
    pasaportId: string;
    misafirAdi: string;
    destinasyon: string;
    ulke: string;
    girisTarihi?: string | null;
    cikisTarihi?: string | null;
}

function tarihAraligi(giris?: string | null, cikis?: string | null): string {
    if (!giris || !cikis) return '';
    const g = new Date(giris);
    const c = new Date(cikis);
    const ay = c.toLocaleDateString('en-US', { month: 'long' });
    return `${g.getDate()}–${c.getDate()} ${ay} ${c.getFullYear()}`;
}

/** Kredi karti boyutunda (ISO/IEC 7810 ID-1, 85.6x54mm) on/arka PDF hatira karti uretir. */
export async function pasaportKartiIndir(veri: PasaportKartVerisi) {
    const qrDataUrl = await QRCode.toDataURL(`https://origintag.com.tr/memory/${veri.pasaportId}`, {
        width: 360,
        margin: 2,
        color: { dark: '#101415', light: '#ffffff' },
    });

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });

    // ON YUZ
    pdf.setFillColor(16, 20, 21);
    pdf.rect(0, 0, 85.6, 54, 'F');
    pdf.setTextColor(178, 230, 48);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text('ORIGINTAG MEMORIES', 6, 8);
    pdf.setTextColor(224, 227, 229);
    pdf.setFontSize(13);
    pdf.text(`MY ${veri.destinasyon.toUpperCase()}`, 6, 18);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(veri.misafirAdi, 6, 26);
    pdf.setFontSize(7);
    pdf.setTextColor(160, 165, 162);
    pdf.text(`${veri.destinasyon}, ${veri.ulke}`, 6, 32);
    pdf.text(tarihAraligi(veri.girisTarihi, veri.cikisTarihi), 6, 37);
    pdf.setFontSize(6);
    pdf.text(veri.pasaportId, 6, 49);

    // ARKA YUZ
    pdf.addPage([85.6, 54], 'landscape');
    pdf.setFillColor(16, 20, 21);
    pdf.rect(0, 0, 85.6, 54, 'F');
    pdf.addImage(qrDataUrl, 'PNG', 30.8, 6, 24, 24);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(224, 227, 229);
    pdf.text('Scan to relive your journey', 42.8, 34, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(160, 165, 162);
    pdf.text('origintag.com.tr', 42.8, 39, { align: 'center' });

    pdf.save(`${veri.pasaportId}-memory-card.pdf`);
}
