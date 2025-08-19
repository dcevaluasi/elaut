import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import axios, { AxiosResponse } from 'axios'
import { PelatihanMasyarakat } from '@/types/product'
import { ESELON_1, ESELON_2 } from '@/constants/nomenclatures'
import { elautBaseUrl } from '@/constants/urls'

export const useFetchDataPelatihanMasyarakatForApproval = () => {
  const [approvalNotes, setApprovalNotes] = useState<string>('')
  const [data, setData] = useState<PelatihanMasyarakat[]>([])
  const pathname = usePathname()

  const isLemdiklatLevel = pathname.includes('lemdiklat')
  const isSupervisor = Cookies.get('Eselon') === 'Supervisor'
  const isPejabat = Cookies.get('Jabatan')?.includes('Kepala')
  const isEselonI = Cookies.get('Jabatan')?.includes(ESELON_1.fullName)
  const isEselonII = Cookies.get('Jabatan')?.includes(ESELON_2.fullName)

  const [isFetching, setIsFetching] = useState<boolean>(false)

  // COUNTERS
  const [countVerifying, setCountVerifying] = useState<number>(0)
  const [countApproval, setCountApproval] = useState<number>(0)
  const [countApproved, setCountApproved] = useState<number>(0)
  const [countSigning, setCountSigning] = useState<number>(0)
  const [countSigningEselon1, setCountSigningEselon1] = useState<number>(0)
  const [countSigningByKaBPPSDMKP, setCountSigningByKaBPPSDMKP] = useState<
    number
  >(0)
  const [countSignedEselon1, setCountSignedEselon1] = useState<number>(0)
  const [countSignedEselon2, setCountSignedEselon2] = useState<number>(0)

  const handleFetchingPublicTrainingData = async () => {
    setIsFetching(true)

    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihanAdmin`,
        {
          headers: { Authorization: `Bearer ${Cookies.get('XSRF091')}` },
        },
      )

      const allData: PelatihanMasyarakat[] = response?.data?.data || []
      let filteredData: PelatihanMasyarakat[] = []

      if (isEselonI) {
        filteredData = allData.filter(
          (item) => item.TtdSertifikat === ESELON_1.fullName,
        )
      } else if (isEselonII) {
        filteredData = allData.filter(
          (item) =>
            item.TtdSertifikat === ESELON_1.fullName ||
            item.TtdSertifikat === ESELON_2.fullName,
        )
      } else {
        filteredData = allData
      }

      const countStatuses = (
        statusKey: keyof PelatihanMasyarakat,
        value: any,
      ) => filteredData.filter((item) => item[statusKey] === value).length

      setCountVerifying(
        countStatuses(
          'PemberitahuanDiterima',
          'Pengajuan Telah Dikirim ke SPV',
        ),
      )
      setCountApproval(
        countStatuses(
          'PemberitahuanDiterima',
          'Pengajuan Telah Dikirim ke SPV',
        ),
      )
      setCountApproved(
        countStatuses(
          'IsMengajukanPenerbitan',
          'Pengajuan Telah Diapprove SPV',
        ),
      )

      // KAPUSLAT POV
      setCountSigning(
        filteredData.filter(
          (item) =>
            item.PemberitahuanDiterima ===
              'Pengajuan Telah Dikirim ke Kapuslat KP' &&
            item.TtdSertifikat === ESELON_2.fullName,
        ).length,
      )
      setCountSigningEselon1(
        filteredData.filter(
          (item) =>
            item.PemberitahuanDiterima ===
              'Pengajuan Telah Dikirim ke Ka BPPSDM KP' &&
            item.TtdSertifikat === ESELON_1.fullName,
        ).length,
      )
      setCountSigningByKaBPPSDMKP(
        filteredData.filter(
          (item) =>
            item.PemberitahuanDiterima ===
              'Pengajuan Telah Dikirim ke Kapuslat KP' &&
            item.TtdSertifikat === ESELON_1.fullName,
        ).length,
      )
      setCountSignedEselon1(
        filteredData.filter(
          (item) =>
            item.StatusPenerbitan === 'Done' &&
            item.TtdSertifikat === ESELON_1.fullName,
        ).length,
      )
      setCountSignedEselon2(
        filteredData.filter(
          (item) =>
            item.StatusPenerbitan === 'Done' &&
            item.TtdSertifikat === ESELON_2.fullName,
        ).length,
      )

      setData([...filteredData].reverse())
      setIsFetching(false)
    } catch (error) {
      console.error('Error fetching training data:', error)
      setIsFetching(false)
    }
  }

  useEffect(() => {
    handleFetchingPublicTrainingData()
  }, [])

  return {
    approvalNotes,
    setApprovalNotes,
    data,
    isLemdiklatLevel,
    isSupervisor,
    isPejabat,
    isEselonI,
    isEselonII,
    isFetching,
    setIsFetching,
    countVerifying,
    countApproval,
    countApproved,
    countSigning,
    countSigningEselon1,
    countSigningByKaBPPSDMKP,
    countSignedEselon1,
    countSignedEselon2,
    refetch: handleFetchingPublicTrainingData,
  }
}
