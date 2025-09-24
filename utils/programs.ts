import { RumpunPelatihan } from '@/types/program'

export function findNameRumpunPelatihanById(
  rumpunPelatihans: RumpunPelatihan[],
  idRumpunPelatihan: string | undefined,
) {
  if (!idRumpunPelatihan) {
    return { name: '' }
  }

  const match = rumpunPelatihans.find(
    (rp) => rp.id_rumpun_pelatihan === parseInt(idRumpunPelatihan),
  )

  if (match) {
    return { name: match.name }
  } else {
    return { name: '' }
  }
}
