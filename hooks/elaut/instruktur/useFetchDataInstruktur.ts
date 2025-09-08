'use client'

import { useState, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { Instruktur } from '@/types/instruktur'

export function useFetchDataInstruktur() {
  const [instrukturs, setInstrukturs] = useState<Instruktur[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const token = Cookies.get('XSRF091')

  const fetchInstrukturData = useCallback(async () => {
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

      setInstrukturs(response.data.data || [])
      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }, [])

  return { instrukturs, loading, error, fetchInstrukturData }
}
