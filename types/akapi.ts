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
  data: DataLembaga
}

export type DataLembaga = {
  dataLembaga: any[]
}

export type SummarySertifikatByLemdiklatItem = {
  Lembaga: string
  sertifikat: SummarySertifikatByLemdiklatSubItem
}

export type SummarySertifikatByLemdiklatSubItem = {
  'Nama Diklat': string
  total: number
}
