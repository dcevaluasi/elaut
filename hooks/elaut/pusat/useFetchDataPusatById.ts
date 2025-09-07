'use client'

import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { PusatDetail } from '@/types/pusat'

export function useFetchDataPusatById(id: string | number) {
  const [adminPusatData, setAdminPusatData] = useState<PusatDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const token = Cookies.get('XSRF091')

  const fetchAdminPusatData = useCallback(async () => {
    if (!token) {
      setError('Token is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(
        `${elautBaseUrl}/getAdminPusatById?id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setAdminPusatData(response.data?.data || null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    if (id) {
      fetchAdminPusatData()
    }
  }, [id, fetchAdminPusatData])

  return { adminPusatData, loading, error, fetchAdminPusatData }
}
