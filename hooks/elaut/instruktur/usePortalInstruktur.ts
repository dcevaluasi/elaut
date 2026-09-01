'use client'

import { useCallback, useState } from 'react'
import axios from 'axios'
import { elautBaseUrl } from '@/constants/urls'
import { ProfilInstrukturPortal } from '@/types/instruktur'

/**
 * Akses data untuk Portal Instruktur.
 *
 * Berbeda dengan `useFetchDataInstruktur` yang dipakai admin, hook ini memanggil
 * endpoint publik `/instruktur/nip/:nip` dan `/instruktur/self/:nip` — tanpa
 * token, karena instruktur masuk hanya dengan NIP. Endpoint itu dibatasi laju
 * permintaannya di backend, jadi galat 429 perlu ditangani terpisah.
 */

/** Kolom yang boleh diubah instruktur sendiri. Harus cocok dengan whitelist backend. */
export type PayloadProfilInstruktur = {
  nama: string
  email: string
  no_telpon: string
  pendidikkan_terakhir: string
  Golongan: string
  eselon_1: string
  eselon_2: string
  jenis_pelatih: string
  jenjang_jabatan: string
  bidang_keahlian: string
  jenis_sisjamu: string
  label: string
  jenis_label: string
  metodologi_pelatihan: string
  pelatihan_pelatih: string
  kompetensi_teknis: string
  management_of_training: string
  training_officer_course: string
  link_data_dukung_sertifikat: string
}

export type HasilPortal<T> =
  | { status: 'sukses'; data: T }
  | { status: 'tidak-ditemukan' }
  | { status: 'terlalu-sering' }
  | { status: 'galat'; pesan: string }

function petakanGalat<T>(error: unknown): HasilPortal<T> {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return { status: 'tidak-ditemukan' }
    if (error.response?.status === 429) return { status: 'terlalu-sering' }

    const pesan = (error.response?.data as { error?: string })?.error
    if (pesan) return { status: 'galat', pesan }

    if (!error.response) {
      return {
        status: 'galat',
        pesan: 'Tidak dapat menghubungi server. Periksa koneksi Anda.',
      }
    }
  }

  return { status: 'galat', pesan: 'Terjadi kesalahan yang tidak terduga.' }
}

export function usePortalInstruktur() {
  const [sedangMemuat, setSedangMemuat] = useState(false)

  const cariBerdasarkanNip = useCallback(
    async (nip: string): Promise<HasilPortal<ProfilInstrukturPortal>> => {
      setSedangMemuat(true)
      try {
        const response = await axios.get<ProfilInstrukturPortal>(
          `${elautBaseUrl}/instruktur/nip/${nip}`,
        )
        return { status: 'sukses', data: response.data }
      } catch (error) {
        return petakanGalat<ProfilInstrukturPortal>(error)
      } finally {
        setSedangMemuat(false)
      }
    },
    [],
  )

  const simpanProfil = useCallback(
    async (
      nip: string,
      payload: PayloadProfilInstruktur,
    ): Promise<HasilPortal<ProfilInstrukturPortal>> => {
      setSedangMemuat(true)
      try {
        const response = await axios.put<{
          message: string
          data: ProfilInstrukturPortal
        }>(`${elautBaseUrl}/instruktur/self/${nip}`, payload)
        return { status: 'sukses', data: response.data.data }
      } catch (error) {
        return petakanGalat<ProfilInstrukturPortal>(error)
      } finally {
        setSedangMemuat(false)
      }
    },
    [],
  )

  return { cariBerdasarkanNip, simpanProfil, sedangMemuat }
}
