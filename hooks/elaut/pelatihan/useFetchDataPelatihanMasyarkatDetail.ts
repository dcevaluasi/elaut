'use client'

import React, { useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { PelatihanMasyarakat } from '@/types/product'
import { elautBaseUrl } from '@/constants/urls'

export function useFetchDataPelatihanMasyarakatDetail(
  idPelatihan: string | number,
) {
  const [data, setData] = React.useState<PelatihanMasyarakat | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!idPelatihan) return

    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get('XSRF091')

      const response = await axios.get(
        `${elautBaseUrl}/getPelatihanUser?idPelatihan=${idPelatihan}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setData(response.data)
    } catch (err) {
      console.error('LEMDIK INFO:', err)
      setError('Failed to fetch detail pelatihan')
    } finally {
      setLoading(false)
    }
  }, [idPelatihan])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
