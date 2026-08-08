import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard', '/urun-ekle', '/api/'],
        },
        sitemap: 'https://origintag.com.tr/sitemap.xml',
    };
}
