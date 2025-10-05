import { PelatihanMasyarakat, UserPelatihan } from '@/types/product'

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
  let filtered = dataPelatihan

  if (Cookies.get('Role') === 'Pengelola UPT') {
    return filtered.filter(
      (item) => item.PenyelenggaraPelatihan === nameBalaiPelatihan,
    )
  } else if (Cookies.get('Role') === 'Pengelola Pusat') {
    return filtered
  } else {
    return filtered
  }
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
