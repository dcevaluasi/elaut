export interface RumpunPelatihan {
  id_rumpun_pelatihan: number
  name: string
  nama_rumpun_pelatihan?: string
  created: string
  updated: string
  programs: ProgramPelatihan[]
}

export interface ProgramPelatihan {
  // IdProgramPelatihan: number
  // IDRumpunPelatihan: number
  // NameIndo: string
  // NameEnglish: string
  // AbbrvName: string
  // Description: string
  // CreatedAt: string
  // UpdatedAt: string
  id_program_pelatihan: number
  id_rumpun_pelatihan: number
  name_indo: string
  name_english: string
  abbrv_name: string
  description: string
  created_at: string
  updated_at: string
}
