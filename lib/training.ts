import { PelatihanMasyarakat } from '@/types/product'
import { UserPelatihan } from '@/types/user'

export const getFilteredDataByBalai = (
  dataUser: UserPelatihan[],
  isAdminBalaiPelatihan: boolean,
  nameBalaiPelatihan: string,
): UserPelatihan[] => {
  if (isAdminBalaiPelatihan) {
    return dataUser.filter(
      (item) => item.PenyelenggaraPelatihan === nameBalaiPelatihan,
    )
  }
  return dataUser
}

export const getFilteredDataPelatihanByBalai = (
  dataPelatihan: PelatihanMasyarakat[],
  isAdminBalaiPelatihan: boolean,
  nameBalaiPelatihan: string,
): PelatihanMasyarakat[] => {
  if (isAdminBalaiPelatihan) {
    return dataPelatihan.filter(
      (item) => item.PenyelenggaraPelatihan === nameBalaiPelatihan,
    )
  }
  return dataPelatihan
}
