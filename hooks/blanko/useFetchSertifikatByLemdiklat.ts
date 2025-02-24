import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'
import { akapiBaseUrl, blankoAkapiBaseUrl } from '@/constants/urls'
import { SummarySertifikatByLemdiklat } from '@/types/akapi'

const useFetchSertifikatyByLemdiklat = () => {
  const [data, setData] = useState<SummarySertifikatByLemdiklat | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const handleFetchingSertifikatyByLemdiklat = async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${akapiBaseUrl}/get-balai-sertifikat?waktu_awal=2024-06-01&waktu_berakhir=2025-12-31`,
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
