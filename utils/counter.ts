import { UserPelatihan } from '@/types/user'

export const countValidKeterangan = (data: UserPelatihan[]): number => {
  return data.filter((item) => item.Keterangan === 'Valid').length
}

export const countUserWithNoSertifikat = (data: UserPelatihan[]): number => {
  return data.filter((item) => item.NoSertifikat !== '').length
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
