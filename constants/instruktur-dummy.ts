import { Instruktur } from '@/types/instruktur'

/**
 * Data sementara untuk membangun tampilan Portal Instruktur.
 * Diganti panggilan API begitu endpoint pencarian NIP tersedia.
 *
 * Tiga profil dengan tingkat kelengkapan berbeda supaya progress bar
 * dan penanda "belum lengkap" bisa diuji.
 */


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
