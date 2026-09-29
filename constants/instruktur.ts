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

export const JENIS_KELAMIN = ['Laki-laki', 'Perempuan']

/** Status kepegawaian ASN. Mengisi kolom `jenis_asn` di backend. */
export const JENIS_ASN = ['PNS', 'PPPK']

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

/**
 * Mengikuti kategori laporan Puslat KP ("Jumlah Widyaiswara dan Instruktur
 * Menurut Bidang Keahlian"), supaya rekap dashboard sama dengan laporan.
 */
export const BIDANG_KEAHLIAN = [
  'Diklat Fungsional',
  'Diklat Struktural',
  'Diklat Teknis',
  'Manajerial',
  'Garam',
  'Pembudidayaan Ikan',
  'Pengelolaan One Data',
  'Pengelolaan Sumberdaya KP',
  'Pengolahan Hasil Perikanan',
  'Perikanan Tangkap',
  'Permesinan Perikanan',
  'Konservasi',
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

/**
 * `label` menentukan isian kepakaran lain supaya tidak saling bertentangan:
 * jenis pelatih mengikuti label, dan pilihan jenjang serta jenis label hanya
 * yang diawali nama label itu. Pelatih non Instruktur (guru, dosen, tim teknis)
 * tidak punya jenjang JF Instruktur/Widyaiswara: jenis pelatih dan jenis label
 * dikosongkan, sedangkan jenjangnya (jabatan asalnya) dibiarkan apa adanya.
 */
export function aturanKepakaran(label: string) {
  const jf = JENIS_PELATIH.includes(label) ? label : ''
  return {
    jenisPelatih: jf,
    jenjang: jf ? JENJANG_JABATAN.filter((j) => j.startsWith(jf)) : [],
    jenisLabel: jf ? JENIS_LABEL_INSTRUKTUR.filter((j) => j.startsWith(jf)) : [],
  }
}

/** Pesan kesalahan pertama pada isian kepakaran, atau `null` bila sudah konsisten. */
export function cekKepakaran(
  nilai: Pick<
    Instruktur,
    'label' | 'jenis_pelatih' | 'jenjang_jabatan' | 'jenis_label' | 'bidang_keahlian'
  >,
): string | null {
  if (!LABEL_INSTRUKTUR.includes(nilai.label)) return 'Label wajib dipilih.'
  const aturan = aturanKepakaran(nilai.label)
  if (nilai.jenis_pelatih !== aturan.jenisPelatih)
    return 'Jenis pelatih harus sesuai label.'
  if (aturan.jenisPelatih && !aturan.jenjang.includes(nilai.jenjang_jabatan))
    return 'Jenjang jabatan wajib dipilih sesuai label.'
  if (aturan.jenisPelatih && !aturan.jenisLabel.includes(nilai.jenis_label))
    return 'Jenis label wajib dipilih sesuai label.'
  if (!BIDANG_KEAHLIAN.includes(nilai.bidang_keahlian))
    return 'Bidang keahlian wajib dipilih dari daftar.'
  return null
}

export const STATUS_KEAKTIFAN = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Tugas Belajar', label: 'Tugas belajar' },
  { value: 'No Active', label: 'Tidak aktif / pensiun' },
]

/** Label yang ditampilkan untuk nilai `status` apa pun yang datang dari backend. */
export function labelStatusKeaktifan(status: string): string {
  return STATUS_KEAKTIFAN.find((item) => item.value === status)?.label || status
}

/**
 * Field yang dihitung untuk persentase kelengkapan profil.
 * `tahun_pensiun` sengaja tidak ikut: instruktur tidak bisa mengisinya sendiri,
 * jadi memasukkannya akan menahan kelengkapan di bawah 100% tanpa jalan keluar.
 */
export const TRACKED_FIELDS: (keyof Instruktur)[] = [
  'nama',
  'nip',
  'email',
  'no_telpon',
  'jenis_kelamin',
  'jenis_asn',
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
