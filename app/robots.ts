import type { MetadataRoute } from "next";

const SITE = "https://elaut-bppsdm.kkp.go.id";

/** app/robots.ts — halaman publik di-allow, area privat di-disallow. */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // TODO: sesuaikan dengan prefix route privat yang sebenarnya
                disallow: ["/dashboard", "/admin", "/api", "/login", "/registrasi"],
            },
        ],
        sitemap: `${SITE}/sitemap.xml`,
        host: SITE,
    };
}
