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
