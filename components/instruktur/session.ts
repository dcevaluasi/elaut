import { Instruktur } from '@/types/instruktur'

/**
 * Sesi instruktur disimpan di sessionStorage: hilang saat tab ditutup, dan
 * tidak ikut terkirim ke server seperti cookie. Cukup untuk tahap UI ini.
 * Diganti token dari server begitu endpoint pencarian NIP tersedia.
 */
export const SESSION_KEY = 'elaut-instruktur-sesi'

export function bacaSesiInstruktur(): Instruktur | null {
  if (typeof window === 'undefined') return null

  const mentah = sessionStorage.getItem(SESSION_KEY)
  if (!mentah) return null

  try {
    return JSON.parse(mentah) as Instruktur
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function hapusSesiInstruktur() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}
