import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'
import { blankoAkapiBaseUrl } from '@/constants/urls'
import { SummarySertifikatByLemdiklat } from '@/types/akapi'

const useFetchSertifikatyByLemdiklat = () => {
  const [data, setData] = useState<SummarySertifikatByLemdiklat | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const handleFetchingSertifikatyByLemdiklat = async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${blankoAkapiBaseUrl}/getBalaiSertifikat`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('XSRF091')}`,
          },
        },
      )
      console.log({ response })
      setData(response.data)
      setIsFetching(false)
    } catch (error) {
      setIsFetching(false)
      throw error
    }
  }

  useEffect(() => {
    handleFetchingSertifikatyByLemdiklat()
  }, [])

  return {
    data,
    isFetching,
    refetch: handleFetchingSertifikatyByLemdiklat, // Expose refetch for manual calls
  }
}

export default useFetchSertifikatyByLemdiklat
