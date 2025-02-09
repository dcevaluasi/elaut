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
  data_unit_kerja: SummarySertifikatByLemdiklatItem[]
}

export type SummarySertifikatByLemdiklatItem = {
  Lembaga: string
  sertifikat: SummarySertifikatByLemdiklatSubItem[]
}

export type SummarySertifikatByLemdiklatSubItem = {
  'Nama Diklat': string
  total: number
}
