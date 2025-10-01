import { PelatihanMasyarakat } from '@/types/product'
import { UserPelatihan } from '@/types/user'
import Cookies from 'js-cookie'

export const getFilteredDataByBalai = (
  dataUser: UserPelatihan[],
  nameBalaiPelatihan: string,
): UserPelatihan[] => {
  if (Cookies.get('Role') === 'Pengelola UPT') {
    return dataUser.filter(
      (item) => item.PenyelenggaraPelatihan === nameBalaiPelatihan,
    )
  } else if (Cookies.get('Role') === 'Pengelola Pusat') {
    return dataUser
  } else {
    return dataUser
  }
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

export const getDataByBidangPelatihan = (dataUser: UserPelatihan[]) => {
  const result: Record<string, number> = {}

  dataUser.forEach((item) => {
    if (item.BidangPelatihan && item.FileSertifikat !== '') {
      result[item.BidangPelatihan] = (result[item.BidangPelatihan] || 0) + 1
    }
  })

  return Object.entries(result).map(([name, count]) => ({
    name,
    count,
  }))
}
