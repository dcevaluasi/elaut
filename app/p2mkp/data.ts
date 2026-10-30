import { Award, CheckCircle2, FileText, MapPin, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Regions                                                             */
/* ------------------------------------------------------------------ */
export type RegionGroup = { name: string; icon: string; color: string; provinces: string[] };

export const ISLAND_GROUPS: RegionGroup[] = [
  { name: "Sumatera", icon: "🌴", color: "from-emerald-500 to-teal-600", provinces: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Bengkulu", "Lampung"] },
  { name: "Jawa & Bali", icon: "🏯", color: "from-blue-500 to-indigo-600", provinces: ["DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Bali"] },
  { name: "Kalimantan", icon: "🌿", color: "from-amber-500 to-orange-600", provinces: ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara"] },
  { name: "Sulawesi", icon: "🐚", color: "from-cyan-500 to-blue-600", provinces: ["Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara"] },
  { name: "Nusa Tenggara", icon: "🦎", color: "from-violet-500 to-purple-600", provinces: ["Nusa Tenggara Barat", "Nusa Tenggara Timur"] },
  { name: "Maluku & Papua", icon: "🦜", color: "from-rose-500 to-pink-600", provinces: ["Maluku", "Maluku Utara", "Papua Barat", "Papua Barat Daya", "Papua Tengah", "Papua Pegunungan", "Papua Selatan", "Papua"] },
];

export const BPPP_GROUPS: RegionGroup[] = [
  { name: "BPPP Medan", icon: "🌊", color: "from-emerald-500 to-teal-600", provinces: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Kepulauan Riau", "Riau", "Jambi", "Bengkulu", "Kepulauan Bangka Belitung", "Sumatera Selatan"] },
  { name: "BPPP Tegal", icon: "⚓", color: "from-blue-500 to-indigo-600", provinces: ["Lampung", "Banten", "Jawa Barat", "DKI Jakarta", "Jawa Tengah", "DI Yogyakarta", "Kalimantan Barat"] },
  { name: "BPPP Banyuwangi", icon: "⛵", color: "from-amber-500 to-orange-600", provinces: ["Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Selatan", "Kalimantan Tengah"] },
  { name: "BPPP Bitung", icon: "🐠", color: "from-cyan-500 to-blue-600", provinces: ["Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Kalimantan Timur", "Kalimantan Utara"] },
  { name: "BPPP Ambon", icon: "🏝️", color: "from-rose-500 to-pink-600", provinces: ["Papua", "Papua Barat", "Papua Barat Daya", "Papua Tengah", "Papua Pegunungan", "Papua Selatan", "Maluku", "Maluku Utara", "Sulawesi Tenggara"] },
];

/* ------------------------------------------------------------------ */
/*  Classification legend (map pin colours)                             */
/* ------------------------------------------------------------------ */
export const UNCLASSIFIED = "Tidak Terklasifikasi";

export const KLASIFIKASI_LEGEND = [
  { label: "Utama", color: "#10b981" },
  { label: "Madya", color: "#3b82f6" },
  { label: "Pemula", color: "#6366f1" },
  { label: UNCLASSIFIED, color: "#94a3b8" },
] as const;

/* ------------------------------------------------------------------ */
/*  Hero stats that do not come from the API                            */
/*  (keep these numbers in sync with official reports)                  */
/* ------------------------------------------------------------------ */
export const STATIC_STATS = {
  sdmTerlatih: 10000,
  pertumbuhanPersen: 15,
};

/* ------------------------------------------------------------------ */
/*  How to join (used by the flow section and the FAQ)                  */
/* ------------------------------------------------------------------ */
export type FlowStep = { title: string; desc: string; tag: string; icon: LucideIcon };

export const FLOW_STEPS: FlowStep[] = [
  { title: "Persiapan", desc: "Penyusunan dokumen & asesmen mandiri di portal.", tag: "Dokumen", icon: FileText },
  { title: "Verifikasi", desc: "Pemeriksaan kelayakan administrasi oleh Pusat Pelatihan KP.", tag: "Review", icon: CheckCircle2 },
  { title: "Visitasi", desc: "Peninjauan langsung fasilitas & sarana prasarana.", tag: "Survey", icon: MapPin },
  { title: "Penetapan", desc: "Penetapan dan penerbitan sertifikat resmi sebagai P2MKP.", tag: "Final", icon: Award },
];

/* ------------------------------------------------------------------ */
/*  FAQ — plain data, rendered by <FaqAnswer> in FaqSection.tsx         */
/* ------------------------------------------------------------------ */
type Step = { title: string; desc: string };

export type FaqAnswer =
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[]; columns?: 1 | 2 }
  | { kind: "steps"; items: Step[]; solid?: boolean }
  | { kind: "checks"; items: string[] }
  | { kind: "levels"; intro: string; items: { rank: string; title: string; badge: string; desc: string }[] }
  | {
      kind: "durations";
      intro: string;
      items: { level: string; duration: string; badge: string; accent: string }[];
      note: { title: string; text: string };
    };

export type FaqItem = { question: string; answer: FaqAnswer };
export type FaqTab = { id: string; label: string; icon: string; items: FaqItem[] };

export const FAQ_TABS: FaqTab[] = [
  {
    id: "p2mkp",
    label: "Seputar P2MKP",
    icon: "🏛️",
    items: [
      {
        question: "Apa itu P2MKP?",
        answer: {
          kind: "text",
          text: "Pusat Pelatihan Mandiri Kelautan dan Perikanan yang selanjutnya disingkat P2MKP adalah lembaga pelatihan kelautan dan perikanan mandiri yang dibentuk, dikelola, dan dilaksanakan oleh pelaku usaha di sektor kelautan dan perikanan.",
        },
      },
      {
        question: "Bidang usaha atau pelatihan apa saja yang dapat mengajukan sebagai P2MKP?",
        answer: {
          kind: "list",
          columns: 2,
          items: ["Pengelolaan ruang laut", "Penangkapan ikan", "Pengangkutan ikan", "Pembudidayaan ikan", "Pengolahan ikan", "Pemasaran ikan"],
        },
      },
      {
        question: "Apa saja syarat menjadi P2MKP?",
        answer: {
          kind: "list",
          items: [
            "Memiliki dan telah menjalankan usaha paling singkat selama 1 (satu) tahun.",
            "Memiliki unit produksi dan/atau usaha yang dapat dicontoh, ditiru, dan/atau dipelajari oleh masyarakat.",
            "Melayani Pelaku Usaha, Pelaku Pendukung, dan masyarakat lainnya untuk kegiatan pelatihan dan magang.",
            "Memiliki peralatan produksi dan/atau usaha yang sesuai dengan standar usahanya serta dapat digunakan untuk pelatihan dan magang.",
            "Menyediakan sarana akomodasi yang layak bagi peserta pelatihan dan magang.",
            "Memiliki tenaga kepelatihan yang terdiri atas pelatih dan pengelola pelatihan yang dibutuhkan untuk mendukung penyelenggaraan pelatihan.",
            "Memiliki kepengurusan yang dilengkapi dengan struktur organisasi dan rincian tugas serta tanggung jawab masing-masing secara jelas.",
            "Memiliki manajemen yang baik.",
            "Memiliki materi pelatihan dan/atau bahan ajar sesuai dengan bidang usahanya.",
            "Tidak berafiliasi dengan partai politik.",
          ],
        },
      },
      {
        question: "Dasar hukum apa yang mengatur P2MKP?",
        answer: {
          kind: "text",
          text: "P2MKP diatur berdasarkan Peraturan Menteri Kelautan dan Perikanan Republik Indonesia No. 18 Tahun 2024. Regulasi ini mencakup seluruh aspek pembentukan, pengelolaan, klasifikasi, dan pembinaan P2MKP.",
        },
      },
      {
        question: "Siapa yang dapat mendirikan P2MKP?",
        answer: {
          kind: "text",
          text: "P2MKP dapat didirikan oleh pelaku usaha di bidang kelautan dan perikanan yang telah menjalankan usahanya secara aktif selama minimal 1 (satu) tahun dan memenuhi seluruh persyaratan teknis dan administratif yang ditetapkan.",
        },
      },
    ],
  },
  {
    id: "penetapan",
    label: "Seputar Penetapan",
    icon: "📋",
    items: [
      {
        question: "Apa saja tahapan penetapan P2MKP?",
        answer: { kind: "steps", solid: true, items: FLOW_STEPS.map(({ title, desc }) => ({ title, desc })) },
      },
      {
        question: "Bagaimana proses verifikasi setelah dokumen diajukan?",
        answer: {
          kind: "steps",
          items: [
            { title: "Pemeriksaan Dokumen (5 Hari)", desc: "Tim pusat akan mengecek kelengkapan berkas dan rekomendasi dinas Anda dalam waktu maksimal 5 hari kerja." },
            { title: "Melengkapi Berkas (7 Hari)", desc: "Jika ada dokumen yang kurang, Anda akan diberikan waktu 7 hari kerja untuk segera melengkapinya." },
            { title: "Keputusan Tahap Awal", desc: "Jika dokumen tetap tidak lengkap setelah batas waktu perbaikan, permohonan dengan berat hati harus ditolak." },
          ],
        },
      },
      {
        question: "Bagaimana proses survei lapangan (visitasi) dilakukan?",
        answer: {
          kind: "steps",
          items: [
            { title: "Peninjauan Lokasi (14 Hari)", desc: "Setelah dokumen beres, tim ahli akan mengunjungi lokasi usaha Anda (atau via online) dalam waktu maksimal 14 hari kerja." },
            { title: "Pemeriksaan Kesesuaian", desc: "Tim akan memastikan apa yang Anda tulis di dokumen benar-benar sesuai dengan kondisi nyata di lapangan." },
            { title: "Rapat Pleno", desc: "Tim validasi akan mendiskusikan hasil kunjungan untuk menentukan apakah usaha Anda layak menjadi P2MKP." },
            { title: "Masa Perbaikan (7 Hari)", desc: "Jika ada temuan yang belum sesuai, Anda diberi waktu 7 hari untuk melakukan penyesuaian sebelum keputusan akhir." },
          ],
        },
      },
      {
        question: "Berapa lama berlakunya sertifikat penetapan P2MKP?",
        answer: {
          kind: "text",
          text: "Penetapan P2MKP berlaku selama 2 (dua) tahun atau sampai dengan diterbitkannya sertifikat klasifikasi P2MKP yang bersangkutan.",
        },
      },
      {
        question: "Dokumen apa saja yang harus disiapkan untuk pengajuan penetapan?",
        answer: {
          kind: "list",
          items: [
            "Formulir Identifikasi Calon P2MKP",
            "Formulir Asesmen Mandiri",
            "Surat Pernyataan Calon P2MKP",
            "Surat Keterangan Legalitas Usaha (NIB / SIUP)",
            "Surat Tidak Berafiliasi dengan Partai Politik",
            "Surat Rekomendasi dari Dinas terkait",
            "Surat Permohonan Pembentukan P2MKP",
          ],
        },
      },
    ],
  },
  {
    id: "klasifikasi",
    label: "Seputar Klasifikasi",
    icon: "🏆",
    items: [
      {
        question: "Apa itu Klasifikasi P2MKP?",
        answer: {
          kind: "text",
          text: "Klasifikasi P2MKP adalah penilaian tingkat kemampuan dan kapasitas lembaga P2MKP yang ditetapkan berdasarkan hasil evaluasi terhadap aspek sumber daya manusia, sarana prasarana, kurikulum, dan manajemen kelembagaan.",
        },
      },
      {
        question: "Apa saja tingkatan klasifikasi P2MKP?",
        answer: {
          kind: "levels",
          intro: "Klasifikasi P2MKP terdiri dari 3 (tiga) tingkatan, dari yang terendah hingga tertinggi:",
          items: [
            { rank: "3", title: "Pemula", badge: "🥉", desc: "Tingkat Pemula (terendah). Bagi P2MKP yang baru ditetapkan dengan kapasitas dan fasilitas dasar sesuai standar minimal." },
            { rank: "2", title: "Madya", badge: "🥇", desc: "Tingkat kedua. P2MKP dengan kapasitas, manajemen, dan kurikulum pelatihan yang lebih komprehensif." },
            { rank: "1", title: "Utama", badge: "🏆", desc: "Tingkat tertinggi. P2MKP unggulan dengan standar fasilitas, SDM, manajemen, dan kemitraan yang excellent." },
          ],
        },
      },
      {
        question: "Bagaimana proses penilaian klasifikasi dilakukan?",
        answer: {
          kind: "steps",
          solid: true,
          items: [
            { title: "Pengajuan & Evaluasi Mandiri", desc: "P2MKP mengisi formulir penilaian mandiri mencakup aspek SDM, sarana, manajemen, dan kurikulum." },
            { title: "Verifikasi Lapangan", desc: "Tim penilai melakukan kunjungan untuk memvalidasi data yang telah dilaporkan oleh P2MKP." },
            { title: "Sidang Klasifikasi", desc: "Rapat pleno menentukan tingkat klasifikasi berdasarkan akumulasi skor penilaian." },
            { title: "Penerbitan Sertifikat", desc: "Sertifikat klasifikasi resmi diterbitkan dan berlaku selama periode yang ditetapkan." },
          ],
        },
      },
      {
        question: "Berapa lama masa berlaku sertifikat klasifikasi P2MKP?",
        answer: {
          kind: "durations",
          intro: "Masa berlaku sertifikat klasifikasi P2MKP berbeda-beda tergantung tingkatannya:",
          items: [
            { level: "Pemula", duration: "2 (dua) tahun", badge: "🥉", accent: "border-amber-500/30 bg-amber-500/5" },
            { level: "Madya", duration: "4 (empat) tahun", badge: "🥇", accent: "border-indigo-500/30 bg-indigo-500/5" },
            { level: "Utama", duration: "5 (lima) tahun", badge: "🏆", accent: "border-purple-500/30 bg-purple-500/5" },
          ],
          note: {
            title: "Permohonan Klasifikasi Kembali",
            text: "Dalam hal masa berlaku sertifikat klasifikasi P2MKP berakhir, pengelola P2MKP harus mengajukan permohonan klasifikasi kembali secara tertulis kepada Kepala Badan.",
          },
        },
      },
      {
        question: "Apa manfaat memiliki klasifikasi P2MKP?",
        answer: {
          kind: "checks",
          items: [
            "Mendapat prioritas dalam penunjukan sebagai mitra pelatihan program pemerintah",
            "Akses ke program pembinaan dan pengembangan kapasitas dari BPPP",
            "Pengakuan resmi sebagai lembaga pelatihan berkualitas terstandar nasional",
            "Peningkatan kepercayaan masyarakat dan calon peserta pelatihan",
            "Kemudahan akses terhadap fasilitas pembiayaan dan kemitraan strategis",
          ],
        },
      },
    ],
  },
];

/** Plain text of an answer, used by the FAQ search. */
export function faqAnswerText(answer: FaqAnswer): string {
  switch (answer.kind) {
    case "text":
      return answer.text;
    case "list":
    case "checks":
      return answer.items.join(" ");
    case "steps":
      return answer.items.map((s) => `${s.title} ${s.desc}`).join(" ");
    case "levels":
      return [answer.intro, ...answer.items.map((l) => `${l.title} ${l.desc}`)].join(" ");
    case "durations":
      return [answer.intro, ...answer.items.map((d) => `${d.level} ${d.duration}`), answer.note.text].join(" ");
  }
}
