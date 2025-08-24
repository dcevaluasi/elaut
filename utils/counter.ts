import { MateriPelatihan } from '@/types/product'
import { UserPelatihan } from '@/types/user'

export const countValidKeterangan = (data: UserPelatihan[]): number => {
  return data.filter((item) => item.Keterangan === 'Valid').length
}

export const countUserWithNoSertifikat = (data: UserPelatihan[]): number => {
  return data.filter((item) => item.NoSertifikat !== '').length
}

export const countUserWithNonELAUTCertificate = (
  data: UserPelatihan[],
): number => {
  return data.filter((item) => {
    const file = item.FileSertifikat.toLowerCase()
    return file.includes('drive')
  }).length
}

export const countUserWithCertificate = (data: UserPelatihan[]): number => {
  return data.filter((item) => {
    const file = item.FileSertifikat.toLowerCase()
    return file.includes('signed') || file.includes('drive')
  }).length
}

export const countUserWithDraftCertificate = (
  data: UserPelatihan[],
): number => {
  return data.filter((item) => {
    const file = item.FileSertifikat.toLowerCase()
    return !file.includes('signed') && !file.includes('drive')
  }).length
}

export const countUserWithTanggalSertifikat = (
  data: UserPelatihan[],
): number => {
  return data.filter((item) => item.TanggalSertifikat !== '').length
}

export const countUserWithSpesimenTTD = (data: UserPelatihan[]): number => {
  return data.filter((item) => item.StatusPenandatangan !== '').length
}

export const countUserWithDrafCertificate = (data: UserPelatihan[]): number => {
  return data.filter((item) => item.FileSertifikat !== '').length
}
