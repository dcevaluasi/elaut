export type SummarySertifikatByTypeBlanko = {
  data: SummarySertifikatByTypeBlankoItem[]
  message: string
}

export type SummarySertifikatByTypeBlankoItem = {
  jenis_sertifikat: string
  jumlah_sertifikat: number
}

export type SummarySertifikatByLemdiklat = {
  Pesan: string
  data: DataSummary
}

export type DataSummary = {
  data_lembaga: SummarySertifikatByLemdiklatItem[]
  data_unit_kerja: SummarySertifikatByLemdiklatKeahlianItem[]
}

export type SummarySertifikatByLemdiklatItem = {
  Lembaga: string
  sertifikat: SummarySertifikatByLemdiklatSubItem[]
}

export type SummarySertifikatByLemdiklatKeahlianItem = {
  UnitKerja: string
  sertifikat: SummarySertifikatByLemdiklatKeahlianSubItem[]
}

export type SummarySertifikatByLemdiklatKeahlianSubItem = {
  'Jenis Sertifikat': string
  total: number
}

export type SummarySertifikatByLemdiklatSubItem = {
  'Nama Diklat': string
  total: number
}

export type SummarySertifikatByProgram = {
  Pesan: string
  data: DataSertifikasiSummary
}

export type DataSertifikasiSummary = {
  DataCOP: SummarySertifikatItem[]
  DataCOC: SummarySertifikatItem[]
}

export type SummarySertifikatItem = {
  Sertifikat: string
  Lembaga: SummarySertifikatLembagaItem[]
}

export type SummarySertifikatLembagaItem = {
  NamaLembaga: string
  Total: number
}

// DATA BLANKO
export type SummaryDataBlankoByNameByAddress = {
  message: string
  total_data: number
  data: DataBlankoByNameByAddress[]
}

export type DataBlankoByNameByAddress = {
  s_id: string
  s_nomor_sertifikat: string
  s_serial_no: string
  s_jenis_sertifikat: string
  s_nama: string
  s_tempat_lahir: string
  s_tanggal_lahir: string
  created_on: string
  is_pembaruan: string
  isPrint: string
}

// DATA PROFIL LEMBAGA
export type SummaryDataProfilLembaga = {
  message: string
  total_data: number
  data: DataProfilLembaga[]
}

export type DataProfilLembaga = {
  pl_id: string
  pl_nama_lembaga: string
  pl_nama_pimpinan: string
  pl_jabatan_pimpinan: string
  pl_alamat_lembaga: string
  pl_kategori_lembaga: string
  created_on: string
  program_pengesahan: DataLembaga[]
}

export type DataLembaga = {
  l_id: string
  l_nama_program: string
  l_surat_pengesahan: string
  l_kategori_lembaga: string
  l_kapasitas_peserta: string // Consider changing to `number` if it's always numeric
  l_jenis_program: string
  l_jenis_pendidikan: string
  l_sub_jenis_pendidikan: string
  l_jalur: string | null
  l_no_reg: string
  created_on: string // Consider using `Date` if you plan to parse timestamps
  created_by: string
  updated_on: string
  updated_by: string
  is_delete: number | null
  is_active: string // Consider changing to `boolean` if it's only "0" or "1"
}
