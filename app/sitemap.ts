import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://origintag.com.tr';

    return [
        { url: `${baseUrl}/`, priority: 1 },
        { url: `${baseUrl}/login`, priority: 0.5 },
        { url: `${baseUrl}/register`, priority: 0.5 },
        { url: `${baseUrl}/demo`, priority: 0.5 },
    ];
}
