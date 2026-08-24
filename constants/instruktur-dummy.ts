import { Instruktur } from '@/types/instruktur'

/**
 * Data sementara untuk membangun tampilan Portal Instruktur.
 * Diganti panggilan API begitu endpoint pencarian NIP tersedia.
 *
 * Tiga profil dengan tingkat kelengkapan berbeda supaya progress bar
 * dan penanda "belum lengkap" bisa diuji.
 */
export const DUMMY_INSTRUKTUR: Instruktur[] = [
  // Lengkap
  {
    IdInstruktur: 1,
    nama: 'Dr. Siti Rahmawati, S.Pi., M.Si.',
    nip: '198203142006042001',
    email: 'siti.rahmawati@kkp.go.id',
    no_telpon: '081234567890',
    pendidikkan_terakhir: 'S3',
    eselon_1:
      'Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan',
    eselon_2: 'Pusat Pelatihan Kelautan dan Perikanan',
    id_lemdik: 3,
    status: 'Active',
    jenis_pelatih: 'Widyaiswara',
    jenjang_jabatan: 'Widyaiswara Ahli Madya',
    bidang_keahlian: 'Perikanan Budidaya',
    metodologi_pelatihan: 'https://drive.google.com/file/d/contoh-metodologi',
    pelatihan_pelatih: 'https://drive.google.com/file/d/contoh-tot',
    kompetensi_teknis: 'https://drive.google.com/file/d/contoh-kompetensi',
    management_of_training: 'https://drive.google.com/file/d/contoh-mot',
    training_officer_course: 'https://drive.google.com/file/d/contoh-toc',
    link_data_dukung_sertifikat: 'https://drive.google.com/drive/folders/contoh',
    create_at: '2024-01-15T08:00:00Z',
    update_at: '2026-05-20T10:30:00Z',
  },
  // Separuh terisi
  {
    IdInstruktur: 2,
    nama: 'Bambang Setiawan, S.T.',
    nip: '197911052005011003',
    email: 'bambang.setiawan@kkp.go.id',
    no_telpon: '081398765432',
    pendidikkan_terakhir: 'S1',
    eselon_1:
      'Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan',
    eselon_2: '',
    id_lemdik: 5,
    status: 'Active',
    jenis_pelatih: 'Instruktur',
    jenjang_jabatan: '',
    bidang_keahlian: 'Permesinan Perikanan',
    metodologi_pelatihan: '',
    pelatihan_pelatih: '',
    kompetensi_teknis: 'https://drive.google.com/file/d/contoh-kompetensi-2',
    management_of_training: '',
    training_officer_course: '',
    link_data_dukung_sertifikat: '',
    create_at: '2024-03-02T08:00:00Z',
    update_at: '2025-11-11T09:15:00Z',
  },
  // Hampir kosong — kasus instruktur yang baru didaftarkan admin
  {
    IdInstruktur: 3,
    nama: 'Andi Pratama',
    nip: '199505202020121001',
    email: '',
    no_telpon: '',
    pendidikkan_terakhir: '',
    eselon_1: '',
    eselon_2: '',
    id_lemdik: 0,
    status: '',
    jenis_pelatih: '',
    jenjang_jabatan: '',
    bidang_keahlian: '',
    metodologi_pelatihan: '',
    pelatihan_pelatih: '',
    kompetensi_teknis: '',
    management_of_training: '',
    training_officer_course: '',
    link_data_dukung_sertifikat: '',
    create_at: '2026-07-01T08:00:00Z',
    update_at: '2026-07-01T08:00:00Z',
  },
]

/**
 * Daftar satuan pendidikan. Dihardcode karena `useFetchDataUnitKerja`
 * menuntut token admin yang tidak dimiliki instruktur.
 */
export const DUMMY_LEMDIK = [
  { id: 1, nama: 'Politeknik Ahli Usaha Perikanan Jakarta' },
  { id: 2, nama: 'Politeknik Kelautan dan Perikanan Sidoarjo' },
  { id: 3, nama: 'BPPP Tegal' },
  { id: 4, nama: 'BPPP Banyuwangi' },
  { id: 5, nama: 'BPPP Bitung' },
  { id: 6, nama: 'BPPP Medan' },
  { id: 7, nama: 'BPPP Ambon' },
  { id: 8, nama: 'Balai Pelatihan Kelautan dan Perikanan Aertembaga' },
]

export const PENDIDIKAN_TERAKHIR = [
  'SMA/SMK',
  'D1',
  'D2',
  'D3',
  'D4',
  'S1',
  'S2',
  'S3',
]

export const JENIS_PELATIH = [
  'Widyaiswara',
  'Instruktur',
  'Dosen',
  'Guru',
  'Praktisi',
  'Penyuluh',
]

export const JENJANG_JABATAN = [
  'Widyaiswara Ahli Pertama',
  'Widyaiswara Ahli Muda',
  'Widyaiswara Ahli Madya',
  'Widyaiswara Ahli Utama',
  'Instruktur Ahli Pertama',
  'Instruktur Ahli Muda',
  'Instruktur Ahli Madya',
  'Instruktur Terampil',
  'Instruktur Mahir',
  'Instruktur Penyelia',
]

export const BIDANG_KEAHLIAN = [
  'Perikanan Tangkap',
  'Perikanan Budidaya',
  'Pengolahan Hasil Perikanan',
  'Permesinan Perikanan',
  'Nautika Perikanan',
  'Konservasi dan Kelautan',
  'Mutu dan Keamanan Hasil Perikanan',
  'Kewirausahaan Kelautan dan Perikanan',
]

export const STATUS_KEAKTIFAN = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Tugas Belajar', label: 'Tugas belajar' },
  { value: 'No Active', label: 'Tidak aktif / pensiun' },
]

/** Field yang dihitung untuk persentase kelengkapan profil. */
export const TRACKED_FIELDS: (keyof Instruktur)[] = [
  'nama',
  'nip',
  'email',
  'no_telpon',
  'pendidikkan_terakhir',
  'eselon_1',
  'eselon_2',
  'id_lemdik',
  'status',
  'jenis_pelatih',
  'jenjang_jabatan',
  'bidang_keahlian',
  'metodologi_pelatihan',
  'pelatihan_pelatih',
  'kompetensi_teknis',
  'management_of_training',
  'training_officer_course',
  'link_data_dukung_sertifikat',
]

export function findInstrukturByNip(nip: string): Instruktur | undefined {
  const clean = nip.replace(/\s/g, '')
  return DUMMY_INSTRUKTUR.find((item) => item.nip === clean)
}

export function hitungKelengkapan(
  values: Record<string, string | number | undefined>,
): number {
  const terisi = TRACKED_FIELDS.filter((field) => {
    const value = values[field]
    if (typeof value === 'number') return value > 0
    return typeof value === 'string' && value.trim() !== ''
  }).length

  return Math.round((terisi / TRACKED_FIELDS.length) * 100)
}
