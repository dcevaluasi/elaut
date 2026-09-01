import { Instruktur } from '@/types/instruktur'
import { PROGRAM_SISJAMU } from '@/constants/pelatihan'

/**
 * Daftar pilihan untuk form instruktur — dipakai bersama oleh form admin
 * (`commons/actions/instruktur/*`) dan wizard Portal Instruktur
 * (`app/instruktur/edit-profile`), supaya keduanya tidak pernah berbeda.
 */

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

/** Pangkat/golongan PNS. Mengisi kolom `Golongan` di backend. */
export const GOLONGAN = [
  'I/a - Juru Muda',
  'I/b - Juru Muda Tingkat I',
  'I/c - Juru',
  'I/d - Juru Tingkat I',
  'II/a - Pengatur Muda',
  'II/b - Pengatur Muda Tingkat I',
  'II/c - Pengatur',
  'II/d - Pengatur Tingkat I',
  'III/a - Penata Muda',
  'III/b - Penata Muda Tingkat I',
  'III/c - Penata',
  'III/d - Penata Tingkat I',
  'IV/a - Pembina',
  'IV/b - Pembina Tingkat I',
  'IV/c - Pembina Utama Muda',
  'IV/d - Pembina Utama Madya',
  'IV/e - Pembina Utama',
]

export const JENIS_PELATIH = ['Widyaiswara', 'Instruktur']

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

/**
 * Program SISJAMU yang boleh diampu instruktur. Sengaja meminjam daftar yang
 * sudah dipakai modul pelatihan agar nilainya cocok saat penugasan disusun.
 */
export const JENIS_SISJAMU = PROGRAM_SISJAMU.filter(Boolean)

/** Mengisi kolom `label` di backend. */
export const LABEL_INSTRUKTUR = [
  'Instruktur',
  'Widyaiswara',
  'Pelatih non Instruktur',
]

/** Mengisi kolom `jenis_label` di backend. */
export const JENIS_LABEL_INSTRUKTUR = [
  'Instruktur UPT',
  'Widyaiswara UPT',
  'Instruktur Pusat',
  'Widyaiswara Pusat',
]

export const STATUS_KEAKTIFAN = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Tugas Belajar', label: 'Tugas belajar' },
  { value: 'No Active', label: 'Tidak aktif / pensiun' },
]

/** Label yang ditampilkan untuk nilai `status` apa pun yang datang dari backend. */
export function labelStatusKeaktifan(status: string): string {
  return STATUS_KEAKTIFAN.find((item) => item.value === status)?.label || status
}

/** Field yang dihitung untuk persentase kelengkapan profil. */
export const TRACKED_FIELDS: (keyof Instruktur)[] = [
  'nama',
  'nip',
  'email',
  'no_telpon',
  'pendidikkan_terakhir',
  'Golongan',
  'eselon_1',
  'eselon_2',
  'id_lemdik',
  'status',
  'jenis_pelatih',
  'jenjang_jabatan',
  'bidang_keahlian',
  'jenis_sisjamu',
  'label',
  'jenis_label',
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
