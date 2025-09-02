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

  const fetchAdminPusatData = useCallback(async () => {
    if (!Cookies.get('XSRF091')) {
      setError('Token is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${elautBaseUrl}/getAllAdminPusat`, {
        headers: { Authorization: `Bearer ${Cookies.get('XSRF091')}` },
      })

      setAdminPusatData(response.data.data || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return { adminPusatData, loading, error, fetchAdminPusatData }
}
