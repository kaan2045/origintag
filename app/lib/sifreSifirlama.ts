import crypto from 'crypto';

/** Sifirlama kodunun veritabaninda saklanan ozeti (kodun kendisi saklanmiyor). */
export function kodOzeti(kod: string): string {
    return crypto.createHash('sha256').update(kod).digest('hex');
}
