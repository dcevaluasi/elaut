import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import axios from 'axios'
import { MateriPelatihan } from '@/types/module'
import { moduleBaseUrl } from '@/constants/urls'

export type CountStats = {
  bidang: Record<string, number>
  tahun: Record<string, number>
  verified: Record<string, number>
}

/* -------------------------------------------------------------------------- */
/*  Cache & request bersama                                                    */
/* -------------------------------------------------------------------------- */

type CacheEntry = { data?: MateriPelatihan[]; inflight?: Promise<MateriPelatihan[]> }

/**
 * GET daftar materi dengan dua penghematan:
 * 1. Request yang sedang berjalan dipakai bersama (beberapa komponen yang
 *    memanggil endpoint yang sama hanya memicu satu request).
 * 2. Hasil terakhir disimpan supaya bisa ditampilkan langsung (`peek`)
 *    sementara data terbaru diambil di belakang layar.
 */
function createSharedList(urlFor: (key: string) => string) {
  const entries = new Map<string, CacheEntry>()

  return {
    peek: (key: string): MateriPelatihan[] | undefined => entries.get(key)?.data,

    load(key: string): Promise<MateriPelatihan[]> {
      let entry = entries.get(key)
      if (!entry) {
        entry = {}
        entries.set(key, entry)
      }
      if (entry.inflight) return entry.inflight

      const target = entry
      const request = axios
        .get<unknown>(urlFor(key))
        .then((res) => {
          if (!Array.isArray(res.data)) throw new Error('Unexpected response')
          const rows = res.data as MateriPelatihan[]
          target.data = rows
          return rows
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

const LIST_KEY = 'all'

const listApi = createSharedList(
  () => `${moduleBaseUrl}/materi-pelatihan/getMateriPelatihan`,
)
const byIdApi = createSharedList(
  (id) =>
    `${moduleBaseUrl}/materi-pelatihan/getMateriPelatihan?id=${encodeURIComponent(id)}`,
)

/**
 * Panggil setelah menambah/mengubah/menghapus materi supaya pemanggilan
 * fetch berikutnya tidak menampilkan data lama lebih dulu.
 */
export function invalidateMateriPelatihanCache() {
  listApi.clear()
  byIdApi.clear()
}

/* -------------------------------------------------------------------------- */
/*  Daftar materi                                                              */
/* -------------------------------------------------------------------------- */

export const useFetchDataMateriPelatihanMasyarakat = (
  type?: string,
  idUnitKerja?: string,
) => {
  // Data mentah dari server. Penyaringan dilakukan di bawah, jadi mengubah
  // `type` / `idUnitKerja` langsung menyaring ulang tanpa request baru.
  const [raw, setRaw] = useState<MateriPelatihan[]>(
    () => listApi.peek(LIST_KEY) ?? [],
  )
  const [loading, setLoading] = useState(() => !listApi.peek(LIST_KEY))
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const fetchModulPelatihan = useCallback(async () => {
    const id = ++requestId.current
    setError(null)

    // Tampilkan hasil terakhir langsung; spinner hanya jika belum ada data.
    const cached = listApi.peek(LIST_KEY)
    if (cached) setRaw(cached)
    else setLoading(true)

    try {
      const rows = await listApi.load(LIST_KEY)
      if (id === requestId.current) setRaw(rows)
    } catch {
      if (id === requestId.current) setError('Failed to fetch data')
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModulPelatihan()
  }, [fetchModulPelatihan])

  const data = useMemo(() => {
    if (type === 'Modul') {
      return raw.filter((item) => item.BerlakuSampai === '1')
    }
    if (type === 'Bahan Ajar') {
      return raw.filter(
        (item) =>
          item.BerlakuSampai === '2' &&
          item.DeskripsiMateriPelatihan == idUnitKerja,
      )
    }
    return raw
  }, [raw, type, idUnitKerja])

  const stats: CountStats = useMemo(() => {
    const tahun: Record<string, number> = {}
    const bidang: Record<string, number> = {}
    const verified: Record<string, number> = {}

    data.forEach((i) => {
      if (i.Tahun) {
        tahun[i.Tahun] = (tahun[i.Tahun] || 0) + 1
      }
      if (i.BidangMateriPelatihan) {
        bidang[i.BidangMateriPelatihan] =
          (bidang[i.BidangMateriPelatihan] || 0) + 1
      }
      if (i.IsVerified) {
        verified[i.IsVerified] = (verified[i.IsVerified] || 0) + 1
      }
    })

    return { tahun, bidang, verified }
  }, [data])

  return { data, loading, error, fetchModulPelatihan, stats }
}

/* -------------------------------------------------------------------------- */
/*  Satu materi berdasarkan id                                                 */
/* -------------------------------------------------------------------------- */

const peekById = (id: number | string): MateriPelatihan | null =>
  id ? (byIdApi.peek(String(id))?.[0] ?? null) : null

export const useFetchDataMateriPelatihanMasyarakatById = (
  id: number | string,
) => {
  const [data, setData] = useState<MateriPelatihan | null>(() => peekById(id))
  const [loading, setLoading] = useState(() => !peekById(id))
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const fetchData = useCallback(async () => {
    if (!id) return

    const key = String(id)
    const reqId = ++requestId.current
    setError(null)

    // Tampilkan hasil terakhir langsung; spinner hanya jika belum ada data.
    const cached = byIdApi.peek(key)?.[0]
    if (cached) setData(cached)
    else setLoading(true)

    try {
      const rows = await byIdApi.load(key)
      if (reqId === requestId.current) setData(rows[0] ?? null)
    } catch {
      if (reqId === requestId.current) setError('Failed to fetch data')
    } finally {
      if (reqId === requestId.current) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}