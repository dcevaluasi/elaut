import { useState, useCallback, useEffect } from 'react'
import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { PelatihanMasyarakat } from '@/types/product'

export function useFetchDataPelatihanMasyarakat() {
  const [data, setData] = useState<PelatihanMasyarakat[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [countOnProgress, setCountOnProgress] = useState(0)
  const [countDone, setCountDone] = useState(0)
  const [countNotPublished, setCountNotPublished] = useState(0)
  const [countVerifying, setCountVerifying] = useState(0)

  const idLemdik = Cookies.get('IDLemdik')
  const token = Cookies.get('XSRF091')

  const fetchDataPelatihanMasyarakat = useCallback(async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse<{
        data: PelatihanMasyarakat[]
      }> = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihanAdmin?id_lemdik=${idLemdik}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      console.log(response)
      const items = response.data?.data || []

      setCountOnProgress(
        items.filter((i) => i.StatusPenerbitan === 'On Progress').length,
      )
      setCountDone(items.filter((i) => i.StatusPenerbitan === 'Done').length)
      setCountNotPublished(items.filter((i) => i.Status !== 'Publish').length)
      setCountVerifying(
        items.filter((i) => i.StatusPenerbitan === 'Verifikasi Pelaksanaan')
          .length,
      )

      setData([...items].reverse())
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
    countOnProgress,
    countDone,
    countNotPublished,
    countVerifying,
    refetch: fetchDataPelatihanMasyarakat,
  }
}
