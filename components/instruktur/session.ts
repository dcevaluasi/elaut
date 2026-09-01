import { ProfilInstrukturPortal } from '@/types/instruktur'

/**
 * Sesi instruktur disimpan di sessionStorage: hilang saat tab ditutup, dan
 * tidak ikut terkirim ke server seperti cookie.
 *
 * Isinya hanya salinan profil yang sudah dipangkas backend (tanpa kolom sistem),
 * dipakai supaya halaman edit-profile tidak perlu memanggil ulang endpoint
 * pencarian NIP yang dibatasi laju permintaannya.
 */
export const SESSION_KEY = 'elaut-instruktur-sesi'

export function simpanSesiInstruktur(profil: ProfilInstrukturPortal) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(profil))
}

export function bacaSesiInstruktur(): ProfilInstrukturPortal | null {
  if (typeof window === 'undefined') return null

  const mentah = sessionStorage.getItem(SESSION_KEY)
  if (!mentah) return null

  try {
    return JSON.parse(mentah) as ProfilInstrukturPortal
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function hapusSesiInstruktur() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}
