import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import React, { useState, useEffect } from 'react'
import { akapiBaseUrl, devBaseUrl } from '@/constants/urls'
import { Publication } from '@/types/elaut'

const useFetchDetailPublication = (slug: string) => {
  const [data, setData] = useState<Publication | null>(null)
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const fetchData = React.useCallback(async () => {
    if (!slug) return

    setIsFetching(true)
    try {
      const response: AxiosResponse<Publication> = await axios.get(
        `${devBaseUrl}/api/publikasi/${slug}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('XSRF091')}`,
          },
        },
      )
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch publication detail:', error)
    } finally {
      setIsFetching(false)
    }
  }, [slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isFetching,
    refetch: fetchData,
  }
}

export default useFetchDetailPublication
