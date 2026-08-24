import * as z from "zod";
import { AccentName } from "./accents";

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

    // Langkah 3 — Kepakaran
    jenis_pelatih: z.string().min(1, "Jenis pelatih wajib dipilih"),
    jenjang_jabatan: z.string().min(1, "Jenjang jabatan wajib dipilih"),
    bidang_keahlian: z.string().min(1, "Bidang keahlian wajib dipilih"),
    // Tidak semua instruktur mengampu program SISJAMU, jadi opsional.
    jenis_sisjamu: z.string(),
    label: z.string().min(1, "Label wajib dipilih"),
    jenis_label: z.string().min(1, "Jenis label wajib dipilih"),

    // Langkah 4 — Sertifikasi (semua opsional)
    metodologi_pelatihan: linkOpsional,
    pelatihan_pelatih: linkOpsional,
    kompetensi_teknis: linkOpsional,
    management_of_training: linkOpsional,
    training_officer_course: linkOpsional,
    link_data_dukung_sertifikat: linkOpsional,
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
        fields: ["nama", "nip", "email", "no_telpon", "pendidikkan_terakhir", "Golongan"],
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
