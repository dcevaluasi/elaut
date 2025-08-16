export type InstrukturAccess = {
  viewInstruktur: string
  createInstruktur: string
  updateInstruktur: string
  deleteInstruktur: string
}

export type ModulAccess = {
  viewModul: string
  createModul: string
  updateModul: string
  deleteModul: string
}

export type PelatihanAccess = {
  viewPelatihan: string
  createPelatihan: string
  updatePelatihan: string
  deletePelatihan: string
  publishPelatihan: string
  pretestPelatihan: string
  posttestPelatihan: string
}

export type Access =
  | { instruktur: InstrukturAccess }
  | { modul: ModulAccess }
  | { pelatihan: PelatihanAccess }

export type RoleAccess = {
  role: string
  access: Access[]
}
