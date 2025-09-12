export interface MateriPelatihan {
  IdMateriPelatihan: number
  NamaMateriPelatihan: string
  NamaPenderitaMateriPelatihan: string
  DeskripsiMateriPelatihan: string
  BerlakuSampai: string
  BidangMateriPelatihan: string
  CreateAt: string
  UpdateAt: string
  JamPelajaran: string
  ModulPelatihan: ModulPelatihan[]
}

export interface ModulPelatihan {
  IdModulPelatihan: number
  IdMateriPelatihan: number
  NamaModulPelatihan: string
  DeskripsiModulPelatihan: string
  BahanTayang: BahanTayang[]
  FileModule: string
  CreateAt: string
  UpdateAt: string
}

export interface BahanTayang {
  IdBahanTayang: number
  IdModulPelatihan: number
  NamaBahanTayang: string
  DeskripsiBahanTayang: string
  BahanTayang: string
  Creator: string
  CreateAt: string
  UpdateAt: string
}
