import { NextResponse } from 'next/server';
import type { Pool } from 'pg';

import { oturumSurumuKolonunuHazirla, sessionCookieAyarla, sessionTokenOlustur } from './session';

/**
 * Hesabin oturum surumunu artirir -- o ana kadar verilmis butun token'lar (diger
 * cihazlar dahil) gecersizlesir -- ve istegi yapan cihaz acik kalsin diye yeni
 * surumle token uretip hem yanit govdesine (mobil) hem cereze (web) koyar.
 * `ekSet` ayni UPDATE icinde baska bir kolonu (orn. sifre) degistirmek icin:
 * sifre degisip surum artmamasi gibi yari kalmis bir durum olusmasin.
 */
export async function oturumuYenileVeYanitla(
    pool: Pool,
    kullaniciId: number,
    ekSet?: { kolon: 'sifre_hash'; deger: string }
): Promise<NextResponse> {
    await oturumSurumuKolonunuHazirla();
    const r = await pool.query(
        `UPDATE kullanicilar SET oturum_surumu = oturum_surumu + 1${ekSet ? `, ${ekSet.kolon} = $2` : ''}
          WHERE id = $1 RETURNING oturum_surumu`,
        ekSet ? [kullaniciId, ekSet.deger] : [kullaniciId]
    );
    const surum: number = r.rows[0].oturum_surumu;

    const sessionToken = sessionTokenOlustur(kullaniciId, surum);
    const yanit = NextResponse.json({ basari: true, sessionToken });
    sessionCookieAyarla(yanit, sessionToken);
    return yanit;
}
