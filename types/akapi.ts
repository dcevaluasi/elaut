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
  data: SummarySertifikatItem[]
  DataCOC: SummarySertifikatItem[]
}

export type SummarySertifikatItem = {
  sertifikat: string
  Lembaga: SummarySertifikatLembagaItem[]
}

export type SummarySertifikatLembagaItem = {
  nama_lembaga: string;
  total: number
}