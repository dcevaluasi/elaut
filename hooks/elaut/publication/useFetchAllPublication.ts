import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import React, { useState, useEffect } from 'react'
import { akapiBaseUrl, devBaseUrl } from '@/constants/urls'
import { PublicationList } from '@/types/elaut'

const useFetchAllPublication = (initialParams: {
  search?: string
  doc_type?: string
}) => {
  const [params, setParams] = useState(initialParams)
  const [data, setData] = useState<PublicationList>([])
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const fetchData = React.useCallback(async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse<PublicationList> = await axios.get(
        `${devBaseUrl}/api/publikasi`,
        {
          params,
          headers: {
            Authorization: `Bearer ${Cookies.get('XSRF091')}`,
          },
        },
      )
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch publikasi:', error)
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

export default useFetchAllPublication
