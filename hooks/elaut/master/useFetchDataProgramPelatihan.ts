import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { elautBaseUrl } from '@/constants/urls'
import { ProgramPelatihan } from '@/types/program'

export const useFetchDataProgramPelatihan = () => {
  const [data, setData] = useState<ProgramPelatihan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgramPelatihan = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await axios.get<ProgramPelatihan[]>(
        `${elautBaseUrl}/program_pelatihan/get_program_pelatihan`,
      )

      setData(res.data)
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProgramPelatihan()
  }, [])

  return { data, loading, error, fetchProgramPelatihan }
}
