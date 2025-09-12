import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { MateriPelatihan } from '@/types/module'
import { moduleBaseUrl } from '@/constants/urls'

export const useFetchDataMateriPelatihanMasyarakat = () => {
  const [data, setData] = useState<MateriPelatihan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchModulPelatihan = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await axios.get<MateriPelatihan[]>(
        `${moduleBaseUrl}/materi-pelatihan/getMateriPelatihan`,
      )
      setData(res.data)
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModulPelatihan()
  }, [])

  return { data, loading, error, fetchModulPelatihan }
}

export const useFetchDataMateriPelatihanMasyarakatById = (id: number) => {
  const [data, setData] = useState<MateriPelatihan[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get<MateriPelatihan[]>(
        `${moduleBaseUrl}/materi-pelatihan/getMateriPelatihan?id=${id}`,
      )
      setData(res.data)
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
