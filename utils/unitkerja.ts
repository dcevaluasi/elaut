import { UnitKerja } from '@/types/master'

export function findUnitKerjaById(
  unitKerjas: UnitKerja[],
  idUnitKerja: string | undefined,
) {
  if (!idUnitKerja) {
    return { isMatch: false, name: null }
  }

  const match = unitKerjas.find(
    (uk) => uk.id_unit_kerja === parseInt(idUnitKerja),
  )

  if (match) {
    return { isMatch: true, name: match.nama }
  } else {
    return { isMatch: false, name: '' }
  }
}

export function findNameUnitKerjaById(
  unitKerjas: UnitKerja[],
  idUnitKerja: string | undefined,
) {
  if (!idUnitKerja) {
    return { name: '' }
  }

  const match = unitKerjas.find(
    (uk) => uk.id_unit_kerja === parseInt(idUnitKerja),
  )

  if (match) {
    return { name: match.nama }
  } else {
    return { name: '' }
  }
}
