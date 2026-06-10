'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'tr' | 'en';

interface LanguageContextType {
    lang: Language;
    setLang: (l: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    tr: {
        'nav.dashboard': 'Panel',
        'nav.addProduct': 'Ürün Ekle',
        'nav.logout': 'Çıkış',
        'nav.login': 'Giriş Yap',
        'nav.register': 'Kayıt Ol',
        'dashboard.title': 'Ürünlerim',
        'dashboard.addNew': 'Yeni Ürün Ekle',
        'dashboard.noProducts': 'Henüz ürün eklenmedi.',
        'dashboard.qrDownload': 'QR İndir',
        'dashboard.share': 'Paylaş',
        'product.title': 'Ürün Ekle',
        'product.name': 'Ürün Adı',
        'product.type': 'Ürün Tipi',
        'product.region': 'Bölge',
        'product.harvestDate': 'Hasat Tarihi',
        'product.amount': 'Miktar',
        'product.unit': 'Birim',
        'product.description': 'Açıklama',
        'product.submit': 'Kaydet',
        'verify.title': 'Ürün Doğrulama',
        'verify.authentic': 'Bu ürün orijinaldir',
        'verify.notFound': 'Ürün bulunamadı',
        'verify.producer': 'Üretici',
        'verify.region': 'Bölge',
        'verify.harvestDate': 'Hasat Tarihi',
        'verify.amount': 'Miktar',
        'login.title': 'Giriş Yap',
        'login.email': 'E-posta',
        'login.password': 'Şifre',
        'login.submit': 'Giriş',
        'login.noAccount': 'Hesabın yok mu?',
        'login.register': 'Kayıt Ol',
        'register.title': 'Kayıt Ol',
        'register.firstName': 'Ad',
        'register.lastName': 'Soyad',
        'register.company': 'Firma',
        'register.email': 'E-posta',
        'register.password': 'Şifre',
        'register.submit': 'Kayıt Ol',
        'register.hasAccount': 'Zaten hesabın var mı?',
        'landing.hero': 'Tarım Ürünlerinizi Dijital Kimlikle Güvence Altına Alın',
        'landing.sub': 'QR kod ve blockchain teknolojisiyle üreticiden tüketiciye şeffaf izlenebilirlik.',
        'landing.cta': 'Ücretsiz Başla',
        'landing.verify': 'Ürün Doğrula',
    },
    en: {
        'nav.dashboard': 'Dashboard',
        'nav.addProduct': 'Add Product',
        'nav.logout': 'Logout',
        'nav.login': 'Login',
        'nav.register': 'Register',
        'dashboard.title': 'My Products',
        'dashboard.addNew': 'Add New Product',
        'dashboard.noProducts': 'No products added yet.',
        'dashboard.qrDownload': 'Download QR',
        'dashboard.share': 'Share',
        'product.title': 'Add Product',
        'product.name': 'Product Name',
        'product.type': 'Product Type',
        'product.region': 'Region',
        'product.harvestDate': 'Harvest Date',
        'product.amount': 'Amount',
        'product.unit': 'Unit',
        'product.description': 'Description',
        'product.submit': 'Save',
        'verify.title': 'Product Verification',
        'verify.authentic': 'This product is authentic',
        'verify.notFound': 'Product not found',
        'verify.producer': 'Producer',
        'verify.region': 'Region',
        'verify.harvestDate': 'Harvest Date',
        'verify.amount': 'Amount',
        'login.title': 'Login',
        'login.email': 'Email',
        'login.password': 'Password',
        'login.submit': 'Sign In',
        'login.noAccount': "Don't have an account?",
        'login.register': 'Register',
        'register.title': 'Register',
        'register.firstName': 'First Name',
        'register.lastName': 'Last Name',
        'register.company': 'Company',
        'register.email': 'Email',
        'register.password': 'Password',
        'register.submit': 'Create Account',
        'register.hasAccount': 'Already have an account?',
        'landing.hero': 'Secure Your Agricultural Products with a Digital Identity',
        'landing.sub': 'Transparent traceability from producer to consumer via QR code and blockchain technology.',
        'landing.cta': 'Get Started Free',
        'landing.verify': 'Verify Product',
    },
};

const LanguageContext = createContext<LanguageContextType>({
    lang: 'tr',
    setLang: () => { },
    t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>('tr');

    // Sayfa yüklenince localStorage'dan oku
    useEffect(() => {
        const kayitliDil = localStorage.getItem('origintag_lang') as Language;
        if (kayitliDil === 'tr' || kayitliDil === 'en') {
            setLangState(kayitliDil);
        }
    }, []);

    // Dil değişince localStorage'a kaydet
    const setLang = (yeniDil: Language) => {
        setLangState(yeniDil);
        localStorage.setItem('origintag_lang', yeniDil);
    };

    const t = (key: string): string => translations[lang][key] ?? key;

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
