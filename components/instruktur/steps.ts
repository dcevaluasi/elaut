import * as z from "zod";
import { AccentName } from "./accents";
import { BIDANG_KEAHLIAN, LABEL_INSTRUKTUR, aturanKepakaran } from "@/constants/instruktur";

/** URL opsional: boleh kosong, tapi kalau diisi harus URL yang sah. */
const linkOpsional = z
    .string()
    .trim()
    .refine((value) => value === "" || /^https?:\/\/.+\..+/.test(value), {
        message: "Tautan harus diawali http:// atau https://",
    });

export const instrukturSchema = z.object({
    // Langkah 1 — Data Diri
    nama: z.string().trim().min(3, "Nama lengkap wajib diisi"),
    nip: z.string().trim().length(18, "NIP harus 18 digit"),
    email: z.string().trim().email("Format email tidak valid"),
    no_telpon: z
        .string()
        .trim()
        .min(10, "Nomor telepon minimal 10 digit")
        .regex(/^08\d+$/, "Nomor harus diawali 08 dan hanya berisi angka"),
    jenis_kelamin: z.string().min(1, "Jenis kelamin wajib dipilih"),
    jenis_asn: z.string().min(1, "Jenis ASN wajib dipilih"),
    // Turunan dari data kepegawaian, bukan isian instruktur. Ikut ditampilkan
    // di wizard seperti id_lemdik dan status, tapi tidak dikirim saat menyimpan.
    tahun_pensiun: z.string(),
    pendidikkan_terakhir: z.string().min(1, "Pendidikan terakhir wajib dipilih"),
    // Nama field berhuruf besar mengikuti tag JSON backend (`json:"Golongan"`).
    Golongan: z.string().min(1, "Pangkat/golongan wajib dipilih"),

    // Langkah 2 — Unit Kerja
    eselon_1: z.string().min(1, "Eselon I wajib dipilih"),
    eselon_2: z.string().min(1, "Eselon II wajib dipilih"),
    // id_lemdik, unit_kerja, dan status ditetapkan admin lemdik. Ketiganya hanya
    // ditampilkan di wizard dan tidak ikut dikirim saat menyimpan, jadi tidak
    // divalidasi di sini.
    id_lemdik: z.string(),
    unit_kerja: z.string(),
    status: z.string(),

    // Langkah 3 — Kepakaran. Hanya nilai dari daftar baku yang diterima, agar
    // isian lama yang diketik bebas harus dipilih ulang. Kaitan label dengan
    // jenis pelatih/jenjang/jenis label diperiksa di superRefine di bawah.
    jenis_pelatih: z.string(),
    jenjang_jabatan: z.string(),
    bidang_keahlian: z.string().refine((v) => BIDANG_KEAHLIAN.includes(v), {
        message: "Bidang keahlian wajib dipilih dari daftar",
    }),
    // Tidak semua instruktur mengampu program SISJAMU, jadi opsional.
    jenis_sisjamu: z.string(),
    label: z.string().refine((v) => LABEL_INSTRUKTUR.includes(v), {
        message: "Label wajib dipilih",
    }),
    jenis_label: z.string(),

    // Langkah 4 — Sertifikasi (semua opsional)
    metodologi_pelatihan: linkOpsional,
    pelatihan_pelatih: linkOpsional,
    kompetensi_teknis: linkOpsional,
    management_of_training: linkOpsional,
    training_officer_course: linkOpsional,
    link_data_dukung_sertifikat: linkOpsional,
}).superRefine((nilai, ctx) => {
    const aturan = aturanKepakaran(nilai.label);
    if (!aturan.jenisPelatih) return;
    if (nilai.jenis_pelatih !== aturan.jenisPelatih) {
        ctx.addIssue({ code: "custom", path: ["jenis_pelatih"], message: "Jenis pelatih harus sesuai label" });
    }
    if (!aturan.jenjang.includes(nilai.jenjang_jabatan)) {
        ctx.addIssue({ code: "custom", path: ["jenjang_jabatan"], message: "Jenjang jabatan wajib dipilih" });
    }
    if (!aturan.jenisLabel.includes(nilai.jenis_label)) {
        ctx.addIssue({ code: "custom", path: ["jenis_label"], message: "Jenis label wajib dipilih" });
    }
});

export type InstrukturFormValues = z.infer<typeof instrukturSchema>;

export type StepDefinition = {
    id: number;
    label: string;
    labelPendek: string;
    judul: string;
    deskripsi: string;
    accent: AccentName;
    fields: (keyof InstrukturFormValues)[];
};

export const STEPS: StepDefinition[] = [
    {
        id: 0,
        label: "Data Diri",
        labelPendek: "Diri",
        judul: "Data diri",
        deskripsi: "Identitas dan kontak yang dipakai panitia untuk menghubungi Anda.",
        accent: "biru",
        fields: [
            "nama",
            "nip",
            "email",
            "no_telpon",
            "jenis_kelamin",
            "jenis_asn",
            "pendidikkan_terakhir",
            "Golongan",
        ],
    },
    {
        id: 1,
        label: "Unit Kerja",
        labelPendek: "Kerja",
        judul: "Unit kerja",
        deskripsi: "Penempatan Anda saat ini di lingkungan Kementerian.",
        accent: "emerald",
        fields: ["eselon_1", "eselon_2"],
    },
    {
        id: 2,
        label: "Kepakaran",
        labelPendek: "Pakar",
        judul: "Kepakaran",
        deskripsi: "Bidang yang Anda ampu. Ini yang dipakai sistem saat mencari pengajar.",
        accent: "violet",
        fields: [
            "jenis_pelatih",
            "jenjang_jabatan",
            "bidang_keahlian",
            "jenis_sisjamu",
            "label",
            "jenis_label",
        ],
    },
    {
        id: 3,
        label: "Sertifikasi",
        labelPendek: "Sertif",
        judul: "Sertifikasi",
        deskripsi:
            "Tautan sertifikat Anda. Boleh dilewati sekarang dan dilengkapi kemudian.",
        accent: "ambar",
        fields: [
            "metodologi_pelatihan",
            "pelatihan_pelatih",
            "kompetensi_teknis",
            "management_of_training",
            "training_officer_course",
            "link_data_dukung_sertifikat",
        ],
    },
    {
        id: 4,
        label: "Tinjau",
        labelPendek: "Tinjau",
        judul: "Tinjau sebelum menyimpan",
        deskripsi: "Periksa sekali lagi. Anda masih bisa mengubah bagian mana pun.",
        accent: "biru",
        fields: [],
    },
];

export const LANGKAH_TINJAU = STEPS.length - 1;
