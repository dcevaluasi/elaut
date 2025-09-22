import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { MateriPelatihan } from '@/types/module'
import { moduleBaseUrl } from '@/constants/urls'

export type CountStats = {
  bidang: Record<string, number>
  tahun: Record<string, number>
  verified: Record<string, number>
}

export const useFetchDataMateriPelatihanMasyarakat = (
  type?: string,
  idUnitKerja?: string,
) => {
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
      let filteredData: MateriPelatihan[] = []

      if (type === 'Modul') {
        filteredData = res.data.filter((item) => item.BerlakuSampai === '1')
      } else if (type === 'Bahan Ajar') {
        filteredData = res.data.filter(
          (item) =>
            item.BerlakuSampai === '2' &&
            item.DeskripsiMateriPelatihan == idUnitKerja,
        )
      } else {
        filteredData = res.data
      }

      setData(filteredData)
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModulPelatihan()
  }, [])

  const stats: CountStats = useMemo(() => {
    const tahun: Record<string, number> = {}
    const bidang: Record<string, number> = {}
    const verified: Record<string, number> = {}

    data.forEach((i) => {
      if (i.Tahun) {
        tahun[i.Tahun] = (tahun[i.Tahun] || 0) + 1
      }
      if (i.BidangMateriPelatihan) {
        bidang[i.BidangMateriPelatihan] =
          (bidang[i.BidangMateriPelatihan] || 0) + 1
      }
      if (i.IsVerified) {
        verified[i.IsVerified] = (verified[i.IsVerified] || 0) + 1
      }
    })

    return { tahun, bidang, verified }
  }, [data])

  return { data, loading, error, fetchModulPelatihan, stats }
}

export const useFetchDataMateriPelatihanMasyarakatById = (
  id: number | string,
) => {
  const [data, setData] = useState<MateriPelatihan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(
        `${moduleBaseUrl}/materi-pelatihan/getMateriPelatihan?id=${id}`,
      )
      console.log({ res })
      setData(res.data[0])
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
