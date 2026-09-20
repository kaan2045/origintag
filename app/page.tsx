'use client';
import { useLanguage } from './context/LanguageContext';
import { ICERIK } from './components/landing/icerik';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import Tez from './components/landing/Tez';
import Yolculuk from './components/landing/Yolculuk';
import PasaportDemo from './components/landing/PasaportDemo';
import Kategoriler from './components/landing/Kategoriler';
import Kanit from './components/landing/Kanit';
import Dunya from './components/landing/Dunya';
import Memories from './components/landing/Memories';
import Kapanis from './components/landing/Kapanis';

/**
 * Ana sayfa akışı, bir hikâye gibi:
 * Vadi (hero) → Sorun (tez) → Yolculuk (nasıl çalışır, #vitrin) → Pasaport (deneme)
 * → Ürünler → Kanıt → Dünya (küre) → Memories → Kapanış (vadi, akşam).
 */
export default function Home() {
  const { lang } = useLanguage();
  const c = ICERIK[lang];

  return (
    <main lang={lang} className="theme-light" style={{ margin: 0, padding: 0 }}>
      <Navbar c={c.nav} />
      <Hero c={c.hero} />
      <Tez c={c.tez} />
      <Yolculuk c={c.yolculuk} />
      <PasaportDemo c={c.pasaport} />
      <Kategoriler c={c.kategoriler} />
      <Kanit c={c.kanit} />
      <Dunya c={c.dunya} />
      <Memories c={c.memories} />
      <Kapanis c={c.kapanis} footer={c.footer} />
    </main>
  );
}
