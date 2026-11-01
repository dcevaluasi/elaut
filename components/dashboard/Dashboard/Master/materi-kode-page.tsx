"use client";

/**
 * Halaman lama /master/program-pelatihan/materi/[kode].
 * Materi sekarang dikelola lewat drawer di halaman Program Pelatihan,
 * jadi halaman ini hanya meneruskan ke sana (link lama tetap berfungsi).
 */
import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Page() {
    const router = useRouter();
    const pathname = usePathname() || "";
    const { kode } = useParams();
    const raw = Array.isArray(kode) ? kode[0] : kode;

    useEffect(() => {
        const name = decodeURIComponent(raw || "");
        const listPath = pathname.split("/materi/")[0]; // .../master/program-pelatihan
        router.replace(name ? `${listPath}?materi=${encodeURIComponent(name)}` : listPath);
    }, [raw, pathname, router]);

    return (
        <div className="min-h-[50vh] flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Membuka materi program…
        </div>
    );
}
