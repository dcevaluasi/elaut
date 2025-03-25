import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import React, { useState, useEffect } from 'react'
import { akapiBaseUrl } from '@/constants/urls'
import { SummarySertifikatByProgram } from '@/types/akapi'

const useFetchSertifikatByProgram = (initialParams: {
  waktu_awal: string
  waktu_berakhir: string
}) => {
  const [params, setParams] = useState(initialParams)
  const [data, setData] = useState<SummarySertifikatByProgram | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const fetchData = React.useCallback(async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${akapiBaseUrl}/get-sertifikat-balai`,
        {
          params: {
            is_print: 1,
            ...params,
          },
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
  }, [params])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = (newParams: Partial<typeof initialParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }))
  }

  return {
    data,
    isFetching,
    refetch, // Expose refetch for manual calls
  }
}

export default useFetchSertifikatByProgram
