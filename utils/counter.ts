import { UserPelatihan } from '@/types/user'

export const countValidKeterangan = (data: UserPelatihan[]): number => {
  return data.filter((item) => item.Keterangan === 'Valid').length
}
