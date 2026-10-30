import type { P2MKP } from "@/types/p2mkp";
import type { P2MKPPin } from "@/components/ui/P2MKPLeafletMap";
import { KLASIFIKASI_LEGEND, UNCLASSIFIED } from "./data";

/* ------------------------------------------------------------------ */
/*  Status                                                              */
/* ------------------------------------------------------------------ */
export const isApproved = (status?: string) => !!status && status.toLowerCase().includes("approve");

/* ------------------------------------------------------------------ */
/*  Province names                                                      */
/*  Order matters: more specific names must come before shorter ones    */
/*  ("kepulauan riau" before "riau", "papua barat daya" before          */
/*  "papua barat" before "papua", "maluku utara" before "maluku").      */
/* ------------------------------------------------------------------ */
const PROVINCE_ALIASES: [string, string[]][] = [
  ["Aceh", ["aceh"]],
  ["Sumatera Utara", ["sumatera utara", "sumut"]],
  ["Sumatera Barat", ["sumatera barat", "sumbar"]],
  ["Kepulauan Riau", ["kepulauan riau", "kepri"]],
  ["Riau", ["riau"]],
  ["Jambi", ["jambi"]],
  ["Kepulauan Bangka Belitung", ["bangka", "babel"]],
  ["Sumatera Selatan", ["sumatera selatan", "sumsel"]],
  ["Bengkulu", ["bengkulu"]],
  ["Lampung", ["lampung"]],
  ["DKI Jakarta", ["jakarta", "dki"]],
  ["Jawa Barat", ["jawa barat", "jabar"]],
  ["Banten", ["banten"]],
  ["Jawa Tengah", ["jawa tengah", "jateng"]],
  ["DI Yogyakarta", ["yogyakarta", "diy"]],
  ["Jawa Timur", ["jawa timur", "jatim"]],
  ["Bali", ["bali"]],
  ["Kalimantan Barat", ["kalimantan barat", "kalbar"]],
  ["Kalimantan Tengah", ["kalimantan tengah", "kalteng"]],
  ["Kalimantan Selatan", ["kalimantan selatan", "kalsel"]],
  ["Kalimantan Utara", ["kalimantan utara", "kaltara"]],
  ["Kalimantan Timur", ["kalimantan timur", "kaltim"]],
  ["Sulawesi Utara", ["sulawesi utara", "sulut"]],
  ["Gorontalo", ["gorontalo"]],
  ["Sulawesi Tengah", ["sulawesi tengah", "sulteng"]],
  ["Sulawesi Barat", ["sulawesi barat", "sulbar"]],
  ["Sulawesi Selatan", ["sulawesi selatan", "sulsel"]],
  ["Sulawesi Tenggara", ["sulawesi tenggara", "sultra"]],
  ["Nusa Tenggara Barat", ["nusa tenggara barat", "ntb"]],
  ["Nusa Tenggara Timur", ["nusa tenggara timur", "ntt"]],
  ["Maluku Utara", ["maluku utara"]],
  ["Maluku", ["maluku"]],
  ["Papua Barat Daya", ["papua barat daya"]],
  ["Papua Barat", ["papua barat"]],
  ["Papua Tengah", ["papua tengah"]],
  ["Papua Pegunungan", ["papua pegunungan"]],
  ["Papua Selatan", ["papua selatan"]],
  ["Papua", ["papua"]],
];

export function normalizeProvinsi(raw?: string): string {
  if (!raw) return "";
  const s = raw.trim().toLowerCase();
  const match = PROVINCE_ALIASES.find(([, aliases]) => aliases.some((a) => s.includes(a)));
  return match ? match[0] : raw.trim();
}

/* ------------------------------------------------------------------ */
/*  Coordinates                                                         */
/* ------------------------------------------------------------------ */
const INDONESIA_BOUNDS = { minLat: -12, maxLat: 8, minLng: 94, maxLng: 142 };

/** Finds the first "lat, lng" pair inside Indonesia in a free-text field (also accepts "lng, lat"). */
export function parseCoords(raw?: string): { lat: number; lng: number } | null {
  if (!raw) return null;
  const numbers = Array.from(raw.matchAll(/-?\d+(?:\.\d+)?/g), (m) => parseFloat(m[0]));

  for (let i = 0; i < numbers.length - 1; i++) {
    const [a, b] = [numbers[i], numbers[i + 1]];
    const [lat, lng] = Math.abs(a) > 90 ? [b, a] : [a, b];
    const { minLat, maxLat, minLng, maxLng } = INDONESIA_BOUNDS;
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) return { lat, lng };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Classification                                                      */
/* ------------------------------------------------------------------ */
export type KlasifikasiLabel = (typeof KLASIFIKASI_LEGEND)[number]["label"];

/** Maps any raw value to one of the legend labels. */
export function klasifikasiOf(raw?: string): KlasifikasiLabel {
  const value = (raw ?? "").trim().toLowerCase();
  const match = KLASIFIKASI_LEGEND.find((k) => k.label !== UNCLASSIFIED && k.label.toLowerCase() === value);
  return match ? match.label : UNCLASSIFIED;
}

/* ------------------------------------------------------------------ */
/*  API record → map pin                                                */
/* ------------------------------------------------------------------ */
export function toPin(item: P2MKP): P2MKPPin | null {
  const coords = parseCoords(item.bidang_pelatihan) || parseCoords(item.alamat);
  if (!coords) return null;
  const any = item as P2MKP & Record<string, any>;
  return {
    id: item.IdPpmkp,
    lat: coords.lat,
    lng: coords.lng,
    nama: item.nama_Ppmkp || any.nama_ppmkp || "P2MKP",
    kota: item.kota || "",
    provinsi: item.provinsi || "",
    status: item.status || "Approved",
    pj: item.nama_penanggung_jawab || "",
    alamat: item.alamat || "",
    noTelp: item.no_telp || item.no_telp_penanggung_jawab || "",
    jenisPelatihan: item.jenis_pelatihan || item.jenis_bidang_pelatihan || "",
    klasifikasi: any.klasifikasi || item.klasiikasi || UNCLASSIFIED,
    tahunPenetapan: item.tahun_penetapan || "-",
  };
}
