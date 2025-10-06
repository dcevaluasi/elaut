import { PelatihanMasyarakat } from '@/types/product'

export const countInstrukturFromPelatihans = (
  pelatihans: PelatihanMasyarakat[],
  id_instruktur: number,
) => {
  let count = 0
  const pelatihanNames: string[] = []

  for (const pelatihan of pelatihans) {
    const ids = pelatihan.Instruktur.split(',')
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id))

    if (ids.includes(id_instruktur)) {
      count++
      pelatihanNames.push(pelatihan.NamaPelatihan)
    }
  }

  return {
    id_instruktur,
    jumlah_dipakai: count,
    pelatihans: pelatihanNames,
  }
}
