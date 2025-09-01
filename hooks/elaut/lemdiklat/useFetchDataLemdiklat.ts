'use client'

import { useState, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { LemdiklatDetailInfo } from '@/types/lemdiklat'
import { elautBaseUrl } from '@/constants/urls'

export function useFetchDataLemdiklat() {
  const [lemdikData, setLemdikData] = useState<LemdiklatDetailInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const fetchLemdikData = useCallback(async () => {
    if (!Cookies.get('XSRF091')) {
      setError('Token is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${elautBaseUrl}/lemdik/getLemdik`, {
        headers: { Authorization: `Bearer ${Cookies.get('XSRF091')}` },
      })

      setLemdikData(response.data.data)
      Cookies.set('IDLemdik', response.data.data.IdLemdik.toString())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return { lemdikData, loading, error, fetchLemdikData }
}
