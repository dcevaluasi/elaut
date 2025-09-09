'use client'

import { useState, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { PusatDetail } from '@/types/pusat'

export function useFetchDataPusat() {
  const [adminPusatData, setAdminPusatData] = useState<PusatDetail[]>([])
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
      const response = await axios.get(`${elautBaseUrl}/getAllAdminPusat`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // 🔎 Try adjusting based on actual API response shape
      if (Array.isArray(response.data)) {
        setAdminPusatData(response.data)
      } else if (Array.isArray(response.data.data)) {
        setAdminPusatData(response.data.data)
      } else {
        setAdminPusatData([])
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  return { adminPusatData, loading, error, fetchAdminPusatData }
}
