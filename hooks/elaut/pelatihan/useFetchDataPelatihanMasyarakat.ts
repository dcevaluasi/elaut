import { useState, useCallback, useEffect } from 'react'
import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { PelatihanMasyarakat } from '@/types/product'
import { isPendingSigning, isSigned, isVerifyDiklat } from '@/utils/status'

export function useFetchDataPelatihanMasyarakat() {
  const [data, setData] = useState<PelatihanMasyarakat[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [countDone, setCountDone] = useState(0)
  const [countPublished, setPublished] = useState(0)
  const [countVerifying, setCountVerifying] = useState(0)

  const [countDiklatSPV, setCountDiklatSPV] = useState(0)

  const [countVerifyPelaksanaan, setCountVerifyPelaksanaan] = useState(0)
  const [countPendingSigning, setCountPendingSigning] = useState(0)
  const [countSigned, setCountSigned] = useState(0)

  const idLemdik = Cookies.get('IDLemdik')
  const token = Cookies.get('XSRF091')

  const isLemdiklat =
    Cookies.get('Access')?.includes('createPelatihan') &&
    Cookies.get('Role') != 'Operator Pusat'
  const isPusat =
    Cookies.get('Access')?.includes('createPelatihan') &&
    Cookies.get('Role') == 'Operator Pusat'
  const isVerificator =
    Cookies.get('Access')?.includes('verifyPelaksanaan') &&
    Cookies.get('Access')?.includes('verifyCertificate')
  const isSupervisor =
    Cookies.get('Access')?.includes('supervisePelaksanaan') &&
    Cookies.get('Access')?.includes('superviseCertificate')
  const isEselonIII =
    Cookies.get('Access')?.includes('isSigning') &&
    Cookies.get('Access')?.includes('approveKabalai')
  const isEselonII =
    Cookies.get('Access')?.includes('isSigning') &&
    Cookies.get('Access')?.includes('approveKapuslat')
  const isEselonI =
    Cookies.get('Access')?.includes('isSigning') &&
    Cookies.get('Access')?.includes('approveKabadan')

  const personalizeData = (items: PelatihanMasyarakat[]) => {
    let filtered = [...items]

    if (isLemdiklat) {
      const satker = Cookies.get('Satker')
      filtered = filtered.filter((p) => p.PenyelenggaraPelatihan === satker)
    }

    if (isPusat) {
      filtered = filtered
    }

    if (isVerificator) {
      const idLemdik = Cookies.get('IDLemdik')
      filtered = filtered.filter((p) => p.VerifikatorPelatihan === idLemdik)
    }

    // Supervisor, Eselon III/II/I → no filter, just full dataset
    // but you can add extra personalization if needed
    if (isEselonIII) {
      const satker = Cookies.get('Satker')
      filtered = filtered.filter((p) =>
        satker?.includes(p.PenyelenggaraPelatihan),
      )
    }

    if (isEselonI) {
      const role = Cookies.get('Role')
      filtered = filtered.filter(
        (p) => role?.includes(p.TtdSertifikat) || role == p.TtdSertifikat,
      )
    }

    return filtered.reverse()
  }
  const fetchDataPelatihanMasyarakat = useCallback(async () => {
    setIsFetching(true)

    //  isPusat
    //       ? `${elautBaseUrl}/lemdik/getPelatihanAdmin`
    //       : `${elautBaseUrl}/lemdik/getPelatihanAdmin?id_lemdik=${idLemdik}`
    try {
      const response: AxiosResponse<{
        data: PelatihanMasyarakat[]
      }> = await axios.get(`${elautBaseUrl}/lemdik/getPelatihanAdmin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const items = response.data?.data || []

      // verified diklat by verifikator
      setCountVerifying(
        items.filter((i) => isVerifyDiklat(i.StatusPenerbitan)).length,
      )

      // signed by eselon 3,2,1
      setCountDone(items.filter((i) => isSigned(i.StatusPenerbitan)).length)
      setCountPendingSigning(
        items.filter(
          (i) =>
            isPendingSigning(i.StatusPenerbitan) &&
            (Cookies.get('Role')?.includes(i.TtdSertifikat)! ||
              Cookies.get('Role') == i.TtdSertifikat),
        ).length,
      )
      setCountSigned(
        items.filter(
          (i) =>
            isSigned(i.StatusPenerbitan) &&
            (Cookies.get('Role')?.includes(i.TtdSertifikat)! ||
              Cookies.get('Role') == i.TtdSertifikat),
        ).length,
      )

      // published information
      setPublished(items.filter((i) => i.Status === 'Publish').length)

      setCountDiklatSPV(items.filter((i) => i.StatusPenerbitan === '1').length)

      setData(personalizeData(items))
      setIsFetching(false)
    } catch (error) {
      setIsFetching(false)
      console.error('Error fetching training data:', error)
    }
  }, [idLemdik, token])

  useEffect(() => {
    fetchDataPelatihanMasyarakat()
  }, [fetchDataPelatihanMasyarakat])

  return {
    data,
    isFetching,
    setIsFetching,
    countDone,
    countDiklatSPV,
    countPublished,
    countVerifying,
    countPendingSigning,
    countSigned,
    refetch: fetchDataPelatihanMasyarakat,
  }
}
