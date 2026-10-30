'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
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

/* -------------------------------------------------------------------------- */
/*  Cache & request bersama                                                    */
/* -------------------------------------------------------------------------- */

type CacheEntry<T> = { data?: T; at: number; inflight?: Promise<T> }

/**
 * GET dengan dua penghematan:
 * 1. Request yang sedang berjalan dipakai bersama (beberapa komponen/hook yang
 *    memanggil endpoint yang sama hanya memicu satu request).
 * 2. Hasil terakhir disimpan per token supaya bisa ditampilkan langsung
 *    (`peek`) sementara data terbaru diambil di belakang layar.
 */
function createSharedGet<T>(path: string) {
  const entries = new Map<string, CacheEntry<T>>()

  return {
    /** Data terakhir untuk token ini (bisa sudah basi), atau undefined. */
    peek: (token: string): T | undefined => entries.get(token)?.data,

    /**
     * Ambil data. Jika `maxAge` (ms) diberikan dan cache masih segar, tidak
     * ada request sama sekali.
     */
    load(token: string, maxAge = 0): Promise<T> {
      let entry = entries.get(token)
      if (!entry) {
        entry = { at: 0 }
        entries.set(token, entry)
      }
      if (
        maxAge > 0 &&
        entry.data !== undefined &&
        Date.now() - entry.at < maxAge
      ) {
        return Promise.resolve(entry.data)
      }
      if (entry.inflight) return entry.inflight

      const target = entry
      const request = axios
        .get<T>(`${elautBaseUrl}${path}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          target.data = res.data
          target.at = Date.now()
          return res.data
        })
        .finally(() => {
          target.inflight = undefined
        })
      target.inflight = request
      return request
    },

    clear: () => entries.clear(),
  }
}

const instrukturApi = createSharedGet<Instruktur[]>('/getInstrukturs')
const unitKerjaApi = createSharedGet<{ data: UnitKerja[] }>(
  '/unit-kerja/getAllUnitKerja',
)

/** Daftar unit kerja jarang berubah, jadi tidak perlu diambil ulang tiap kali. */
const UNIT_KERJA_MAX_AGE = 10 * 60 * 1000

/**
 * Panggil setelah menambah/mengubah/menghapus instruktur supaya pemanggilan
 * `fetchInstrukturData` berikutnya tidak menampilkan data lama lebih dulu.
 */
export function invalidateInstrukturCache() {
  instrukturApi.clear()
}

const getToken = () => Cookies.get('XSRF091')
const getTokenWithFallback = () =>
  Cookies.get('XSRF091') || Cookies.get('XSRF081')

/* -------------------------------------------------------------------------- */
/*  Hook dasar: daftar instruktur mentah                                       */
/* -------------------------------------------------------------------------- */

function useInstrukturRows(readToken: () => string | undefined) {
  const [rows, setRows] = useState<Instruktur[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const requestId = useRef(0)

  const fetchInstrukturData = useCallback(async () => {
    const token = readToken()
    if (!token) {
      setError('Token is missing')
      return
    }

    const id = ++requestId.current
    setError(null)

    // Tampilkan hasil terakhir langsung; spinner hanya jika belum ada data.
    const cached = instrukturApi.peek(token)
    if (cached) setRows(cached)
    else setLoading(true)

    try {
      const data = await instrukturApi.load(token)
      if (id === requestId.current) setRows(data ?? [])
    } catch (err) {
      if (id === requestId.current) setError(err)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [readToken])

  return { rows, loading, error, fetchInstrukturData }
}

export function useFetchDataInstrukturChoose() {
  const { rows, loading, error, fetchInstrukturData } =
    useInstrukturRows(getToken)

  return { instrukturs: rows, loading, error, fetchInstrukturData }
}

/** IDUnitKerja milik Puslat KP. */
const ID_PUSLAT_KP = '8'

type FilterOptions = {
  balaiOnly: boolean
  isAkunPusat: boolean
  idUnitKerja?: string
}

function filterInstrukturs(
  rows: Instruktur[],
  semuaUnitKerja: UnitKerja[],
  { balaiOnly, isAkunPusat, idUnitKerja }: FilterOptions,
) {
  if (!isAkunPusat) {
    return rows.filter((row) => String(row.id_lemdik ?? '') === idUnitKerja)
  }
  if (!balaiOnly) return rows

  const balaiIds = new Set<string>([ID_PUSLAT_KP])
  for (const uk of semuaUnitKerja) {
    if (isBalaiPelatihanPuslat(uk.nama)) balaiIds.add(String(uk.id_unit_kerja))
  }
  return rows.filter((row) => balaiIds.has(String(row.id_lemdik ?? '')))
}

/**
 * `balaiOnly`: untuk akun pusat (IDUnitKerja 0) dan Puslat KP (8), batasi ke
 * instruktur Puslat KP, BPPP, dan BDA Sukamandi saja. Akun UPT tetap melihat
 * unitnya sendiri. Daftar unit kerja ikut dikembalikan untuk menamai unit.
 */
export function useFetchDataInstruktur({
  balaiOnly = false,
}: { balaiOnly?: boolean } = {}) {
  const [instrukturs, setInstrukturs] = useState<Instruktur[]>([])
  const [unitKerjas, setUnitKerjas] = useState<UnitKerja[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const requestId = useRef(0)

  const fetchInstrukturData = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setError('Token is missing')
      return
    }

    const cookieIdUnitKerja = Cookies.get('IDUnitKerja')
    const isAkunPusat =
      !cookieIdUnitKerja ||
      cookieIdUnitKerja === '0' ||
      cookieIdUnitKerja === '8'
    const options: FilterOptions = {
      balaiOnly,
      isAkunPusat,
      idUnitKerja: cookieIdUnitKerja,
    }

    const id = ++requestId.current
    setError(null)

    // Tampilkan hasil terakhir langsung (jika cukup untuk menyaring dengan
    // benar); spinner hanya jika belum ada data.
    const cachedRows = instrukturApi.peek(token)
    const cachedUnits = balaiOnly ? unitKerjaApi.peek(token)?.data : []
    const butuhUnit = balaiOnly && isAkunPusat
    if (cachedRows && (cachedUnits || !butuhUnit)) {
      const units = cachedUnits ?? []
      setInstrukturs(filterInstrukturs(cachedRows, units, options))
      setUnitKerjas(units)
    } else {
      setLoading(true)
    }

    try {
      const [rows, unitKerjaResponse] = await Promise.all([
        instrukturApi.load(token),
        balaiOnly
          ? unitKerjaApi.load(token, UNIT_KERJA_MAX_AGE).catch((err) => {
            // Akun pusat butuh daftar ini untuk menyaring; akun UPT hanya
            // memakainya untuk nama unit, jadi kegagalan tidak fatal.
            if (isAkunPusat) throw err
            return null
          })
          : null,
      ])
      if (id !== requestId.current) return

      const units = unitKerjaResponse?.data ?? []
      setInstrukturs(filterInstrukturs(rows ?? [], units, options))
      setUnitKerjas(units)
    } catch (err) {
      if (id === requestId.current) setError(err)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [balaiOnly])

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

  return { instrukturs, unitKerjas, loading, error, fetchInstrukturData, stats }
}

export function useFetchDataInstrukturSelected(ids: number[]) {
  const { rows, loading, error, fetchInstrukturData } =
    useInstrukturRows(getTokenWithFallback)

  // Kunci string supaya array `ids` yang dibuat ulang tiap render tidak
  // memicu hitung ulang; Set membuat pencarian O(1) per baris.
  const idsKey = ids?.join(',') ?? ''
  const instrukturs = useMemo(() => {
    if (!idsKey) return rows
    const wanted = new Set(idsKey.split(',').map(Number))
    return rows.filter((row) => wanted.has(row.IdInstruktur))
  }, [rows, idsKey])

  return { instrukturs, loading, error, fetchInstrukturData }
}