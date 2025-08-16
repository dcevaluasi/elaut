import { Access, RoleAccess } from '@/types/access'

export const ACCESS_ROLE = [
  {
    name:
      'Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan',
    code: 1,
    access: [],
  },
]

export function getAccess<
  T extends keyof Access,
  K extends keyof NonNullable<Access[T]>
>(data: RoleAccess, section: T, key: K): string | undefined {
  const found = data.access.find((a) => section in a)
  return found?.[section]?.[key]
}
