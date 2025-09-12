export type UnitKerja = {
  id_unit_kerja: number
  nama: string
  alamat: string
  lokasi: string
  pimpinan: string
  call_center: string
  tipe: string
  status: string
  created_at: string
  updated_at: string
}

export type UnitKerjaResponse = {
  Pesan: string
  data: UnitKerja[]
}
