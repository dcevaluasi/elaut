import { blankoAkapiBaseUrl } from '@/constants/urls'
import { SummarySertifikatByTypeBlanko } from '@/types/akapi'
import axios, { AxiosResponse } from 'axios'
import { useEffect, useState, useCallback } from 'react'

const useFetchSertifikatByTypeBlanko = (initialParams: {
  type_blanko: string
  start_date: string
  end_date: string
}) => {
  const [params, setParams] = useState(initialParams)
  const [data, setData] = useState<SummarySertifikatByTypeBlanko | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const fetchData = useCallback(async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${blankoAkapiBaseUrl}/dataAkapi`,
        {
          params: {
            is_print: 1,
            ...params,
          },
        },
      )
      setData(response.data)
      console.log(response)
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetching(false)
    }
  }, [params])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = (newParams: Partial<typeof initialParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }))
  }

  return {
    data,
    isFetching,
    refetch,
  }
}

export default useFetchSertifikatByTypeBlanko
