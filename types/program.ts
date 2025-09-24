export interface RumpunPelatihan {
  id_rumpun_pelatihan: number
  name: string
  created: string
  updated: string
  programs: ProgramPelatihan[]
}

export interface ProgramPelatihan {
  IdProgramPelatihan: number
  IDRumpunPelatihan: number
  NameIndo: string
  NameEnglish: string
  AbbrvName: string
  Description: string
  CreatedAt: string
  UpdatedAt: string
}
