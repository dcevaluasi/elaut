import Cookies from 'js-cookie'

export function canManageProgram(rumpunName: string): boolean {
  const access = Cookies.get('Access')?.includes('superAdmin')!
  return access
}

export function canManageProgramUPT(rumpunName: string): boolean {
  const access = Cookies.get('Access')?.includes('superAdmin')!
  return (
    !rumpunName.includes('Awak Kapal Perikanan') &&
    !rumpunName.includes('Sistem Jaminan Mutu') &&
    !access
  )
}
