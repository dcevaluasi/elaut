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
    if (token) {
      setError('Token is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${elautBaseUrl}/getInstrukturs`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setAdminPusatData(response.data.data || [])
      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }, [])

  return { adminPusatData, loading, error, fetchAdminPusatData }
}
