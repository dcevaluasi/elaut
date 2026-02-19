import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { PelatihanMasyarakat } from '@/types/product'
import { isPendingSigning, isSigned, isVerifyDiklat } from '@/utils/status'

export function useFetchDataPelatihanMasyarakat() {
  const [data, setData] = useState<PelatihanMasyarakat[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const fetchId = useRef(0)

  const fetchDataPelatihanMasyarakat = useCallback(async () => {
    const currentFetchId = ++fetchId.current
    setIsFetching(true)

    const token = Cookies.get('XSRF091')
    const role = Cookies.get('Role')
    const satker = Cookies.get('Satker')
    const idLemdik = Cookies.get('IDLemdik')
    const idUnitKerja = Cookies.get('IDUnitKerja')
    const access = Cookies.get('Access') || ''

    try {
      const response: AxiosResponse<{ data: PelatihanMasyarakat[] }> =
        await axios.get(`${elautBaseUrl}/lemdik/getPelatihanAdmin`, {
          headers: { Authorization: `Bearer ${token}` },
        })

      if (currentFetchId !== fetchId.current) return

      const rawItems = response.data?.data || []

      // Flags for personalization
      const isLemdiklat = access.includes('createPelatihan') && role !== 'Pengelola Pusat'
      const isVerificator = access.includes('verifyPelaksanaan') && access.includes('verifyCertificate')
      const isEselonIII = access.includes('isSigning') && access.includes('approveKabalai')
      const isEselonI = access.includes('isSigning') && access.includes('approveKabadan')

      // Single-pass personalized filtering
      const items = rawItems.filter(p => {
        if (isLemdiklat && !(p.PenyelenggaraPelatihan === satker || p.IdUnitKerja == idUnitKerja)) return false
        if (isVerificator && p.VerifikatorPelatihan !== idLemdik) return false
        if (isEselonIII && !satker?.includes(p.PenyelenggaraPelatihan)) return false
        if (isEselonI && !(role?.includes(p.TtdSertifikat) || role == p.TtdSertifikat)) return false
        return true
      }).reverse()

      setData(items)
    } catch (error) {
      console.error('Error fetching training data:', error)
    } finally {
      if (currentFetchId === fetchId.current) setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchDataPelatihanMasyarakat()
  }, [fetchDataPelatihanMasyarakat])

  // Derive counts in a single pass over the data
  const counts = useMemo(() => {
    let done = 0, published = 0, verifying = 0, diklatSPV = 0, pendingSigning = 0, signed = 0
    const role = Cookies.get('Role')

    for (let i = 0; i < data.length; i++) {
      const p = data[i]
      const status = p.StatusPenerbitan

      if (isSigned(status)) done++
      if (p.Status === 'Publish') published++
      if (isVerifyDiklat(status)) verifying++
      if (status === '1') diklatSPV++

      const isRoleMatch = role?.includes(p.TtdSertifikat) || role == p.TtdSertifikat
      if (isPendingSigning(status) && isRoleMatch) pendingSigning++
      if (isSigned(status) && isRoleMatch) signed++
    }

    return {
      countDone: done,
      countPublished: published,
      countVerifying: verifying,
      countDiklatSPV: diklatSPV,
      countPendingSigning: pendingSigning,
      countSigned: signed
    }
  }, [data])

  return {
    data,
    isFetching,
    setIsFetching,
    ...counts,
    refetch: fetchDataPelatihanMasyarakat,
  }
}

export function useFetchAllDataPelatihanMasyarakat() {
  const [data, setData] = useState<PelatihanMasyarakat[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const fetchId = useRef(0)

  const fetchDataPelatihanMasyarakat = useCallback(async () => {
    const currentFetchId = ++fetchId.current
    setIsFetching(true)

    try {
      const token = Cookies.get('XSRF091')
      const role = Cookies.get('Role')
      const satker = Cookies.get('Satker')

      const response: AxiosResponse<{ data: PelatihanMasyarakat[] }> =
        await axios.get(`${elautBaseUrl}/lemdik/getPelatihanAdmin`, {
          headers: { Authorization: `Bearer ${token}` },
        })

      if (currentFetchId !== fetchId.current) return

      const rawItems = response.data?.data || []
      const filtered = role === 'Pengelola UPT'
        ? rawItems.filter(item => item.PenyelenggaraPelatihan === satker)
        : rawItems

      setData(filtered)
    } catch (error) {
      console.error('Error fetching training data:', error)
    } finally {
      if (currentFetchId === fetchId.current) setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchDataPelatihanMasyarakat()
  }, [fetchDataPelatihanMasyarakat])

  return { data, isFetching, refetch: fetchDataPelatihanMasyarakat }
}
