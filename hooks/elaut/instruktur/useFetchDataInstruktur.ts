'use client'

import { useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { Instruktur } from '@/types/instruktur'
import { UnitKerja } from '@/types/master'
import { isBalaiPelatihanPuslat } from '@/utils/unitkerja'

export type CountStats = {
  bidangKeahlian: Record<string, number>
  jenjangJabatan: Record<string, number>
  pendidikanTerakhir: Record<string, number>
  status: Record<string, number>
  tot: number
  /** Jumlah per `label` pelatih; `belumDiisi` = belum punya kategori. */
  kategori: {
    instruktur: number
    widyaiswara: number
    nonInstruktur: number
    belumDiisi: number
  }
}

/**
 * `label` adalah kolom baru; data lama mungkin baru punya `jenis_pelatih`
 * atau `jenjang_jabatan`, jadi keduanya dipakai sebagai cadangan.
 */
export function kategoriPelatih(
  i: Instruktur,
): keyof CountStats['kategori'] {
  const sumber = (i.label || i.jenis_pelatih || i.jenjang_jabatan || '')
    .trim()
    .toLowerCase()
  if (sumber.startsWith('widyaiswara')) return 'widyaiswara'
  if (sumber.startsWith('instruktur')) return 'instruktur'
  if (sumber.startsWith('pelatih non')) return 'nonInstruktur'
  return 'belumDiisi'
}

export function useFetchDataInstrukturChoose() {
  const [instrukturs, setInstrukturs] = useState<Instruktur[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const token = Cookies.get('XSRF091')
  const fetchInstrukturData = useCallback(async () => {
    if (!token) {
      setError('Token is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get<Instruktur[]>(
        `${elautBaseUrl}/getInstrukturs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setInstrukturs(response.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  return { instrukturs, loading, error, fetchInstrukturData }
}

/**
 * `balaiOnly`: untuk akun pusat (IDUnitKerja 0) dan Puslat KP (8), batasi ke
 * instruktur BPPP dan BDA Sukamandi saja. Akun UPT tetap melihat unitnya sendiri.
 */
export function useFetchDataInstruktur({
  balaiOnly = false,
}: { balaiOnly?: boolean } = {}) {
  const [instrukturs, setInstrukturs] = useState<Instruktur[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const token = Cookies.get('XSRF091')
  const cookieIdUnitKerja = Cookies.get('IDUnitKerja')

  const fetchInstrukturData = useCallback(async () => {
    if (!token) {
      setError('Token is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const isAkunPusat =
        !cookieIdUnitKerja ||
        cookieIdUnitKerja.toString() === '0' ||
        cookieIdUnitKerja.toString() === '8'
      const headers = { Authorization: `Bearer ${token}` }

      const [response, unitKerjaResponse] = await Promise.all([
        axios.get<Instruktur[]>(`${elautBaseUrl}/getInstrukturs`, { headers }),
        balaiOnly && isAkunPusat
          ? axios.get<{ data: UnitKerja[] }>(
              `${elautBaseUrl}/unit-kerja/getAllUnitKerja`,
              { headers },
            )
          : null,
      ])

      const balaiIds = unitKerjaResponse
        ? new Set(
            (unitKerjaResponse.data.data || [])
              .filter((uk) => isBalaiPelatihanPuslat(uk.nama))
              .map((uk) => String(uk.id_unit_kerja)),
          )
        : null

      const filtered = (response.data || []).filter((row) => {
        const idLemdik = String(row.id_lemdik ?? '')
        if (!isAkunPusat) return idLemdik === cookieIdUnitKerja
        return balaiIds ? balaiIds.has(idLemdik) : true
      })

      setInstrukturs(filtered)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [token, cookieIdUnitKerja, balaiOnly])

  const stats: CountStats = useMemo(() => {
    const bidangKeahlian: Record<string, number> = {}
    const jenjangJabatan: Record<string, number> = {}
    const pendidikanTerakhir: Record<string, number> = {}
    const status: Record<string, number> = {
      Active: 0,
      'No Active': 0,
      'Tugas Belajar': 0,
    }
    let tot = 0
    const kategori = {
      instruktur: 0,
      widyaiswara: 0,
      nonInstruktur: 0,
      belumDiisi: 0,
    }

    instrukturs.forEach((i) => {
      kategori[kategoriPelatih(i)] += 1
      if (i.bidang_keahlian) {
        bidangKeahlian[i.bidang_keahlian] =
          (bidangKeahlian[i.bidang_keahlian] || 0) + 1
      }
      if (i.jenjang_jabatan) {
        jenjangJabatan[i.jenjang_jabatan] =
          (jenjangJabatan[i.jenjang_jabatan] || 0) + 1
      }
      if (i.pendidikkan_terakhir) {
        pendidikanTerakhir[i.pendidikkan_terakhir] =
          (pendidikanTerakhir[i.pendidikkan_terakhir] || 0) + 1
      }
      if (i.status) {
        status[i.status] = (status[i.status] || 0) + 1
      }
      if (i.training_officer_course != '') {
        tot = tot + 1
      }
    })

    return {
      bidangKeahlian,
      jenjangJabatan,
      pendidikanTerakhir,
      status,
      tot,
      kategori,
    }
  }, [instrukturs])

  return { instrukturs, loading, error, fetchInstrukturData, stats }
}

export function useFetchDataInstrukturSelected(ids: number[]) {
  const [instrukturs, setInstrukturs] = useState<Instruktur[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const token = Cookies.get('XSRF091')

  const fetchInstrukturData = useCallback(async () => {
    if (!token) {
      setError('Token is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get<Instruktur[]>(
        `${elautBaseUrl}/getInstrukturs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const filtered = (response.data || []).filter((row) => {
        const matchInstruktur =
          !ids || ids.length === 0 ? true : ids.includes(row.IdInstruktur)

        return matchInstruktur
      })

      setInstrukturs(filtered)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  return { instrukturs, loading, error, fetchInstrukturData }
}
