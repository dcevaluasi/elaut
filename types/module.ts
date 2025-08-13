export interface ModulPelatihan {
  IdModulPelatihan: number
  IdMateriPelatihan: number
  NamaModulPelatihan: string
  DeskripsiModulPelatihan: string
  BahanTayang: string
  CreateAt: string
  UpdateAt: string
}

export interface MateriPelatihan {
  IdMateriPelatihan: number
  NamaMateriPelatihan: string
  NamaPenderitaMateriPelatihan: string
  DeskripsiMateriPelatihan: string
  BerlakuSampai: string
  BidangMateriPelatihan: string
  CreateAt: string
  UpdateAt: string
  ModulPelatihan: ModulPelatihan[]
}
