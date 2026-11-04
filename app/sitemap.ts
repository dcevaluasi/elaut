import type { MetadataRoute } from "next";

const SITE = "https://elaut-bppsdm.kkp.go.id";

/**
 * app/sitemap.ts — semua halaman publik.
 * `lastModified` diisi tanggal perubahan konten yang nyata; ubah tanggalnya saat isi halaman diperbarui.
 * TODO: tambahkan halaman dinamis dari API (detail pelatihan, per provinsi P2MKP, dll.) di bagian bawah.
 */
const STATIC_PAGES: { path: string; updated: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", updated: "2026-11-01", priority: 1, changeFrequency: "daily" },
    { path: "/pelatihan", updated: "2026-11-01", priority: 0.9, changeFrequency: "daily" },
    { path: "/layanan/cek-sertifikat", updated: "2026-11-01", priority: 0.9, changeFrequency: "monthly" },
    { path: "/p2mkp", updated: "2026-11-01", priority: 0.8, changeFrequency: "weekly" },
    { path: "/video-pelatihan", updated: "2026-11-01", priority: 0.8, changeFrequency: "weekly" },
    { path: "/tentang", updated: "2026-11-01", priority: 0.6, changeFrequency: "yearly" },
];

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const pages: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
        url: `${SITE}${p.path === "/" ? "" : p.path}`,
        lastModified: new Date(p.updated),
        changeFrequency: p.changeFrequency,
        priority: p.priority,
    }));

    // Contoh halaman dinamis (aktifkan bila route detail sudah ada):
    // const res = await fetch(`${API}/pelatihan/public`, { next: { revalidate } });
    // const list = await res.json();
    // pages.push(...list.map((x) => ({ url: `${SITE}/pelatihan/${x.slug}`, lastModified: new Date(x.updated_at) })));

    return pages;
}
