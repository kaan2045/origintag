const UZUN_KENAR_MAKS = 1920;
const JPEG_KALITE = 0.82;

/**
 * Canvas ile resmi kucultup yeniden kodlar (uzun kenar ~1920px, JPEG q~0.82).
 * Depolama maliyetini kontrol altinda tutmak icin hem admin kapak fotografi hem
 * misafirin "Add a Memory" yuklemelerinde kullanilir -- orijinal dosya asla
 * oldugu gibi Blob'a gitmez.
 */
export function resmiSikistir(dosya: File): Promise<File> {
    return new Promise((resolve, reject) => {
        if (!dosya.type.startsWith('image/')) {
            resolve(dosya); // video vb. -- bu fonksiyon sadece resim icin
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(dosya);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;
            if (width > UZUN_KENAR_MAKS || height > UZUN_KENAR_MAKS) {
                if (width >= height) {
                    height = Math.round((height / width) * UZUN_KENAR_MAKS);
                    width = UZUN_KENAR_MAKS;
                } else {
                    width = Math.round((width / height) * UZUN_KENAR_MAKS);
                    height = UZUN_KENAR_MAKS;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(dosya);
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(dosya);
                        return;
                    }
                    const yeniAd = dosya.name.replace(/\.\w+$/, '') + '.jpg';
                    resolve(new File([blob], yeniAd, { type: 'image/jpeg' }));
                },
                'image/jpeg',
                JPEG_KALITE
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(dosya); // sikistirma basarisiz olsa da yuklemeyi engelleme
        };

        img.src = url;
    });
}
