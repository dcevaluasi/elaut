'use client'

import { useState, useCallback } from 'react'
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

  const fetchDataPelatihanMasyarakat = useCallback(async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse<{
        data: PelatihanMasyarakat[]
      }> = await axios.get(
        `${elautBaseUrl}/lemdik/getPelatihanAdmin?id_lemdik=${Cookies.get(
          'IDLemdik',
        )}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('XSRF091')}`,
          },
        },
      )

      const items = response.data?.data || []

      // Count statuses
      setCountOnProgress(
        items.filter((item) => item.StatusPenerbitan === 'On Progress').length,
      )
      setCountDone(
        items.filter((item) => item.StatusPenerbitan === 'Done').length,
      )
      setCountNotPublished(
        items.filter((item) => item.Status !== 'Publish').length,
      )
      setCountVerifying(
        items.filter(
          (item) => item.StatusPenerbitan === 'Verifikasi Pelaksanaan',
        ).length,
      )

      // Sort data in descending order by index (reverse)
      setData([...items].reverse())
    } catch (error) {
      console.error('Error fetching training data:', error)
      throw error
    } finally {
      setIsFetching(false)
    }
  }, [])

  return {
    data,
    isFetching,
    countOnProgress,
    countDone,
    countNotPublished,
    countVerifying,
    fetchDataPelatihanMasyarakat,
  }
}
