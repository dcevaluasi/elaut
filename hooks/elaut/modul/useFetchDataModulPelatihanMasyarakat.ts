import { useState, useEffect } from 'react'
import axios from 'axios'
import { ModulPelatihan } from '@/types/module'
import { moduleBaseUrl } from '@/constants/urls'

export const useFetchDataModulPelatihan = (id: number) => {
  const [data, setData] = useState<ModulPelatihan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<ModulPelatihan>(
          `${moduleBaseUrl}/modul-pelatihan/getModulPelatihan?id=${id}`,
        )
        setData(res.data)
      } catch (err) {
        setError('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  return { data, loading, error }
}
