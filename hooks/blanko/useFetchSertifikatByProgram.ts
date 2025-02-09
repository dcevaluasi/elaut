import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'
import { blankoAkapiBaseUrl } from '@/constants/urls'
import { SummarySertifikatByLemdiklat, SummarySertifikatByProgram, SummarySertifikatItem } from '@/types/akapi'

const useFetchSertifikatByProgram = () => {
  const [data, setData] = useState<SummarySertifikatByProgram | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const handleFetchingSertifikatyByProgram = async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${blankoAkapiBaseUrl}/getSertfikatiBalai`,
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
    handleFetchingSertifikatyByProgram()
  }, [])

  return {
    data,
    isFetching,
    refetch: handleFetchingSertifikatyByProgram, // Expose refetch for manual calls
  }
}

export default useFetchSertifikatByProgram
