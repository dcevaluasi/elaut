import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { DataDukungPesertaPelatihan } from '@/types/pelatihan'
import { Instruktur } from '@/types/instruktur'

export const exportDataDukungToExcel = (data: DataDukungPesertaPelatihan[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Dukung')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  saveAs(blob, 'data_dukung_pelatihan.xlsx')
}

const formatTanggal = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const INSTRUKTUR_COLUMNS: { header: string; width: number }[] = [
  { header: 'No', width: 5 },
  { header: 'Nama', width: 32 },
  { header: 'NIP', width: 22 },
  { header: 'Email', width: 28 },
  { header: 'No. Telepon', width: 16 },
  { header: 'Unit Kerja', width: 38 },
  { header: 'Eselon I', width: 38 },
  { header: 'Eselon II', width: 32 },
  { header: 'Jenis Pelatih', width: 18 },
  { header: 'Jenjang Jabatan', width: 26 },
  { header: 'Bidang Keahlian', width: 26 },
  { header: 'Pendidikan Terakhir', width: 18 },
  { header: 'Status', width: 14 },
  { header: 'Metodologi Pelatihan', width: 34 },
  { header: 'Pelatihan Pelatih (TOT)', width: 34 },
  { header: 'Kompetensi Teknis', width: 34 },
  { header: 'Management of Training (MOT)', width: 34 },
  { header: 'Training Officer Course (TOC)', width: 34 },
  { header: 'Data Dukung Sertifikat', width: 34 },
  { header: 'Tanggal Dibuat', width: 18 },
  { header: 'Terakhir Diperbarui', width: 18 },
]

/**
 * Unduh data instruktur/pelatih sebagai berkas Excel.
 * `resolveUnitKerja` dipakai untuk menerjemahkan id_lemdik menjadi nama unit kerja.
 */
export const exportInstrukturToExcel = (
  data: Instruktur[],
  resolveUnitKerja: (idLemdik: number) => string = () => '',
) => {
  const rows = data.map((row, index) => [
    index + 1,
    row.nama || '-',
    row.nip || '-',
    row.email || '-',
    row.no_telpon || '-',
    resolveUnitKerja(row.id_lemdik) || '-',
    row.eselon_1 || '-',
    row.eselon_2 || '-',
    row.jenis_pelatih || '-',
    row.jenjang_jabatan || '-',
    row.bidang_keahlian || '-',
    row.pendidikkan_terakhir || '-',
    row.status || '-',
    row.metodologi_pelatihan || '-',
    row.pelatihan_pelatih || '-',
    row.kompetensi_teknis || '-',
    row.management_of_training || '-',
    row.training_officer_course || '-',
    row.link_data_dukung_sertifikat || '-',
    formatTanggal(row.create_at),
    formatTanggal(row.update_at),
  ])

  const worksheet = XLSX.utils.aoa_to_sheet([
    INSTRUKTUR_COLUMNS.map((col) => col.header),
    ...rows,
  ])

  worksheet['!cols'] = INSTRUKTUR_COLUMNS.map((col) => ({ wch: col.width }))
  worksheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: rows.length, c: INSTRUKTUR_COLUMNS.length - 1 },
    }),
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Instruktur')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const stamp = new Date().toISOString().slice(0, 10)
  saveAs(blob, `Data Instruktur - ${stamp}.xlsx`)
}
