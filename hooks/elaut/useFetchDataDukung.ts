import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { UserPelatihan } from '@/types/product'

/* =====================================================================
 * Shared store (pola sama dengan useFetchDataPelatihanMasyarakat)
 * - 1 request untuk semua komponen (dedupe in-flight), apa pun isIncludePusat
 * - Cache per token + stale-while-revalidate → buka ulang dashboard = instan
 * - Filter UPT / pusat dihitung di memori (useMemo), bukan fetch ulang
 * ===================================================================== */

const ENDPOINT = `${elautBaseUrl}/getUsersPelatihan`
const STALE_MS = 60_000

type Cache = { token: string; data: UserPelatihan[]; at: number }

let cache: Cache | null = null
let inflight: { token: string; promise: Promise<UserPelatihan[]> } | null = null
const listeners = new Set<(data: UserPelatihan[]) => void>()
const EMPTY: UserPelatihan[] = []

const getToken = () => Cookies.get('XSRF091') || ''
const getCached = () => (cache && cache.token === getToken() ? cache.data : null)
const isFresh = () => !!cache && cache.token === getToken() && Date.now() - cache.at < STALE_MS

function loadDataDukung(force = false): Promise<UserPelatihan[]> {
  const token = getToken()
  if (!force && isFresh()) return Promise.resolve(cache!.data)
  if (inflight && inflight.token === token) return inflight.promise

  const promise = axios
    .get<{ data: UserPelatihan[] }>(ENDPOINT, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => {
      const data = res.data?.data || EMPTY
      cache = { token, data, at: Date.now() }
      listeners.forEach((l) => l(data))
      return data
    })
    .finally(() => {
      if (inflight?.promise === promise) inflight = null
    })

  inflight = { token, promise }
  return promise
}

/** Mulai fetch lebih awal (mis. saat modul di-import). Aman dipanggil berkali-kali. */
export const prefetchDataDukung = () => {
  if (typeof window === 'undefined' || !getToken()) return
  loadDataDukung().catch(() => { })
}

/** Paksa refresh di semua komponen (mis. setelah sertifikat ditandatangani) */
export const invalidateDataDukung = () => loadDataDukung(true)

const useFetchDataDukung = (isIncludePusat: boolean = false) => {
  const [raw, setRaw] = useState<UserPelatihan[]>(() => getCached() ?? EMPTY)
  const [isFetching, setIsFetching] = useState<boolean>(() => !isFresh())
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    listeners.add(setRaw)
    return () => {
      listeners.delete(setRaw)
    }
  }, [])

  const run = useCallback(async (force: boolean) => {
    if (!force && isFresh()) {
      setRaw(cache!.data)
      setIsFetching(false)
      return
    }
    setIsFetching(true)
    setError(null)
    try {
      await loadDataDukung(force)
    } catch (e) {
      setError(e) // tidak di-throw lagi → tidak ada unhandled rejection
      console.error('Error fetching data dukung:', e)
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    run(false)
  }, [run])

  const data = useMemo(() => {
    const satker = Cookies.get('Role') === 'Pengelola UPT' ? Cookies.get('Satker') : null
    if (!satker && isIncludePusat) return raw
    return raw.filter(
      (item) =>
        (!satker || item.PenyelenggaraPelatihan === satker) &&
        (isIncludePusat || !item.PenyelenggaraPelatihan?.toLowerCase().includes('pusat')),
    )
  }, [raw, isIncludePusat])

  const refetch = useCallback(() => run(true), [run])

  return { data, isFetching, error, refetch }
}

export default useFetchDataDukung
