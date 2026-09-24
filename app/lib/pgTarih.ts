import { types } from 'pg';

/**
 * Postgres DATE (oid 1082) alanlarini JS Date'e cevirmeden, oldugu gibi 'YYYY-AA-GG'
 * metni olarak dondur.
 *
 * Varsayilan davranista pg, DATE'i sunucunun yerel saat diliminde gece yarisi sayip
 * Date'e ceviriyor. Sunucu UTC'deyken (Vercel) sorun yok, ama Istanbul saatinde
 * calisan bir sunucuda '2026-08-10' -> 2026-08-09T21:00Z oluyor; formlar ilk 10
 * karakteri aldigi icin duzenleyip kaydetmek hasat tarihini bir gun geri kaydiriyordu.
 * Takvim tarihi saat dilimi tasimaz, oyle de kalmali.
 *
 * Bu dosya yan etki icin import edilir (pg'nin tip ayrisitiricisi sureç geneli).
 */
types.setTypeParser(1082, (deger: string) => deger);
