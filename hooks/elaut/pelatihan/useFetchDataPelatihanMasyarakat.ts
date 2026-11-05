import { useState, useCallback, useEffect, useMemo } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { PelatihanMasyarakat } from '@/types/product'
import { isPendingSigning, isSigned, isVerifyDiklat } from '@/utils/status'

/* =====================================================================
 * Shared store: 1 request untuk semua komponen/hook yang memakai data ini
 * - Dedupe request yang sedang berjalan (in-flight)
 * - Cache per token (ganti user = cache baru)
 * - Stale-while-revalidate: data cache langsung tampil, refresh di belakang
 * ===================================================================== */

const ENDPOINT = `${elautBaseUrl}/lemdik/getPelatihanAdmin`
const STALE_MS = 30_000 // data dianggap fresh selama 30 detik

type Cache = { token: string; data: PelatihanMasyarakat[]; at: number }

let cache: Cache | null = null
let inflight: { token: string; promise: Promise<PelatihanMasyarakat[]> } | null = null
const listeners = new Set<(data: PelatihanMasyarakat[]) => void>()

const EMPTY: PelatihanMasyarakat[] = []

const getToken = () => Cookies.get('XSRF091') || ''

/** Data cache milik user saat ini (boleh stale), atau null */
const getCached = (): PelatihanMasyarakat[] | null =>
  cache && cache.token === getToken() ? cache.data : null

const isFresh = () =>
  !!cache && cache.token === getToken() && Date.now() - cache.at < STALE_MS

function loadPelatihan(force = false): Promise<PelatihanMasyarakat[]> {
  const token = getToken()

  if (!force && isFresh()) return Promise.resolve(cache!.data)
  if (inflight && inflight.token === token) return inflight.promise

  const promise = axios
    .get<{ data: PelatihanMasyarakat[] }>(ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    })
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

/** Mulai fetch lebih awal (mis. saat modul di-import / hover menu). Aman dipanggil berkali-kali. */
export const prefetchPelatihanMasyarakat = () => {
  if (typeof window === 'undefined' || !getToken()) return
  loadPelatihan().catch(() => { })
}

/** Paksa data di-fetch ulang di semua hook (mis. setelah create/update pelatihan) */
export const invalidatePelatihanMasyarakat = () => loadPelatihan(true)

/** Hook dasar: raw data bersama + status fetching */
function useSharedPelatihan() {
  const [raw, setRaw] = useState<PelatihanMasyarakat[]>(() => getCached() ?? EMPTY)
  const [isFetching, setIsFetching] = useState<boolean>(() => !isFresh())

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
    try {
      await loadPelatihan(force)
    } catch (error) {
      console.error('Error fetching training data:', error)
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    run(false)
  }, [run])

  const refetch = useCallback(() => run(true), [run])

  return { raw, isFetching, setIsFetching, refetch }
}

/* =====================================================================
 * Personalisasi (pure function, flag dihitung sekali, 1 loop)
 * ===================================================================== */

function personalize(rawItems: PelatihanMasyarakat[]): PelatihanMasyarakat[] {
  const role = Cookies.get('Role')
  const satker = Cookies.get('Satker')
  const idLemdik = Cookies.get('IDLemdik')
  const idUnitKerja = Cookies.get('IDUnitKerja')
  const access = Cookies.get('Access') || ''

  const isLemdiklat = access.includes('createPelatihan') && role !== 'Pengelola Pusat'
  const isVerificator = access.includes('verifyPelaksanaan') && access.includes('verifyCertificate')
  const isSigning = access.includes('isSigning')
  const isEselonIII = isSigning && access.includes('approveKabalai')
  const isEselonII = isSigning && access.includes('approveKapus')
  const isEselonI = isSigning && access.includes('approveKabadan')

  // Tanpa filter → cukup reverse copy
  if (!isLemdiklat && !isVerificator && !isEselonIII && !isEselonII && !isEselonI) {
    return rawItems.slice().reverse()
  }

  const result: PelatihanMasyarakat[] = []
  // Loop mundur = filter + reverse dalam 1 pass
  for (let i = rawItems.length - 1; i >= 0; i--) {
    const p = rawItems[i]
    const status = String(p.StatusPenerbitan)

    if (isLemdiklat && !(p.PenyelenggaraPelatihan === satker || p.IdUnitKerja == idUnitKerja)) continue
    if (isVerificator && p.VerifikatorPelatihan !== idLemdik) continue
    if (isEselonIII && !(satker?.includes(p.PenyelenggaraPelatihan) || status === '1.4')) continue

    if (isEselonII || isEselonI) {
      const ttdMatch = role?.includes(p.TtdSertifikat) || role == p.TtdSertifikat
      if (isEselonII && !(ttdMatch || status === '10' || status === '8')) continue
      if (isEselonI && !(ttdMatch || status === '14' || status === '12')) continue
    }

    result.push(p)
  }
  return result
}

function computeCounts(data: PelatihanMasyarakat[]) {
  const role = Cookies.get('Role')
  const access = Cookies.get('Access') || ''
  const approveKapus = access.includes('approveKapus')
  const approveKabadan = access.includes('approveKabadan')
  const approveKabalai = access.includes('approveKabalai')

  let done = 0, published = 0, verifying = 0, diklatSPV = 0, pendingSigning = 0, signed = 0

  for (let i = 0; i < data.length; i++) {
    const p = data[i]
    const status = String(p.StatusPenerbitan)
    const signedStatus = isSigned(status)
    const pendingStatus = isPendingSigning(status)

    if (signedStatus) done++
    if (p.Status === 'Publish') published++
    if (status === '1') diklatSPV++
    if (isVerifyDiklat(status)) verifying++

    // Cek role hanya jika perlu
    if (signedStatus || pendingStatus) {
      const isRoleMatch =
        role?.includes(p.TtdSertifikat) || role == p.TtdSertifikat ||
        (approveKapus && (status === '10' || status === '11')) ||
        (approveKabadan && (status === '14' || status === '15')) ||
        (approveKabalai && (status === '1.4' || status === '1.6'))

      if (isRoleMatch) {
        if (pendingStatus) pendingSigning++
        if (signedStatus) signed++
      }
    }
  }

  return {
    countDone: done,
    countPublished: published,
    countVerifying: verifying,
    countDiklatSPV: diklatSPV,
    countPendingSigning: pendingSigning,
    countSigned: signed,
  }
}

/* =====================================================================
 * Public hooks (API sama seperti sebelumnya)
 * ===================================================================== */

export function useFetchDataPelatihanMasyarakat() {
  const { raw, isFetching, setIsFetching, refetch } = useSharedPelatihan()

  const data = useMemo(() => personalize(raw), [raw])
  const counts = useMemo(() => computeCounts(data), [data])

  return {
    data,
    isFetching,
    setIsFetching,
    ...counts,
    refetch,
  }
}

export function useFetchAllDataPelatihanMasyarakat() {
  const { raw, isFetching, refetch } = useSharedPelatihan()

  const data = useMemo(() => {
    if (Cookies.get('Role') !== 'Pengelola UPT') return raw
    const satker = Cookies.get('Satker')
    return raw.filter((item) => item.PenyelenggaraPelatihan === satker)
  }, [raw])

  return { data, isFetching, refetch }
}
