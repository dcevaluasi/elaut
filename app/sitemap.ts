import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://elaut-bppsdm.kkp.go.id'

    const staticRoutes = [
        '',
        '/p2mkp',
        '/p2mkp/login',
        '/p2mkp/registrasi',
        '/layanan/cek-sertifikat',
        '/akp',
        '/dashboard',
    ]

    return staticRoutes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }))
}
