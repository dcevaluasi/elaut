export type Pelatihan = {
  Id: string
  KodePelatihan: string
  CoverPelatihan: string
  JudulPelatihan: string
  TanggalPendaftaran: string
  DeskripsiPelatihan: string
  DetailPelatihan: string
  HargaPelatihan: number
  BidangPelatihan: string
  ListFasilitasPenginapan: FasilitasPenginapan[]
  ListFasilitasKonsumsi: FasilitasKonsumsi[]
  DenganSertifikasi: boolean
  PelaksanaanPelatihan: string
  DukunganProgramTerobosan: string
  LokasiPelatihan: string
}

export type FasilitasPenginapan = {
  Id: string
  NamaFasilitas: string
  HargaFasilitas: number
  Satuan: string
}

export type FasilitasKonsumsi = {
  Id: string
  NamaPaketMakanan: string
  HargaPaketMakanan: number
}

export type JenisPelatihan = {
  Id: string
  Name: string
  Description: string
}

export type BalaiPelatihan = {
  Id: string
  Name: string
  Description: string
  Longitude: number
  Latitude: number
  Location: string
  Image?: string
  KepalaBalaiPelatihan?: string
  FullName: string
}

export type BidangPelatihan = {
  Id: string
  Name: string
  Description: string
  Image: string
  Illustration?: string
  Pelatihan: string[]
}

export type PelaksanaanPelatihan = {
  Id: string
  Name: string
  Description: string
}

export type DataDukungPesertaPelatihan = {
  nama: string
  no_telpon: string
  kota: string
  provinsi: string
  alamat: string
  nik: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'Laki-laki' | 'Perempuan' | string // tambahkan literal jika diperlukan
  pekerjaan: string
  pendidikan_terakhir: string
  no_sertifikat: string
  nama_pelatihan: string
  bidang_pelatihan: string
  tanggal_mulai: string // format ISO date string (e.g. '2025-02-10')
  tanggal_berakhir: string // format ISO date string (e.g. '2025-02-14')
  file_sertifikat: string
  penyelenggara_pelatihan: string
}
