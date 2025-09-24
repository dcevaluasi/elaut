import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { elautBaseUrl } from '@/constants/urls'
import { RumpunPelatihan } from '@/types/program'

export const useFetchDataRumpunPelatihan = () => {
  const [data, setData] = useState<RumpunPelatihan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRumpunPelatihan = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await axios.get(
        `${elautBaseUrl}/rumpun_pelatihan/get_rumpun_pelatihan`,
      )
      console.log({ res })
      setData(res.data.data)
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRumpunPelatihan()
  }, [])

  return { data, loading, error, fetchRumpunPelatihan }
}
