'use client'

import { useState, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { PusatDetail } from '@/types/pusat'

export function useFetchDataPusat(statusPenerbitan?: number | string) {
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

      let data: PusatDetail[] = []
      if (Array.isArray(response.data)) data = response.data
      else if (Array.isArray(response.data.data)) data = response.data.data

      if (statusPenerbitan === 1 || statusPenerbitan === "1" ) {
        data = data.filter((item) =>
          item.Status?.toLowerCase().includes('supervisor'),
        )
      } else if (statusPenerbitan === 2|| statusPenerbitan === "2" ) {
        data = data.filter((item) =>
          item.Status?.toLowerCase().includes('verifikator'),
        )
      }

      setAdminPusatData(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [token, statusPenerbitan])

  return { adminPusatData, loading, error, fetchAdminPusatData }
}
