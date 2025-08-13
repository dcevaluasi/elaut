import { useState, useEffect } from 'react'
import axios from 'axios'
import { MateriPelatihan } from '@/types/module'
import { moduleBaseUrl } from '@/constants/urls'

export const useFetchDataMateriPelatihanMasyarakat = () => {
  const [data, setData] = useState<MateriPelatihan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
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
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
