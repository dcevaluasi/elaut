'use client'

import { useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { UnitKerja } from '@/types/master'

export type CountStats = {
  bidangKeahlian: Record<string, number>
  jenjangJabatan: Record<string, number>
  pendidikanTerakhir: Record<string, number>
  status: Record<string, number>
  tot: number
}

const token = Cookies.get('XSRF091')

export function useFetchDataUnitKerja() {
  const [unitKerjas, setUnitKerjas] = useState<UnitKerja[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const fetchUnitKerjaData = useCallback(async () => {
    if (!token) {
      setError('Token is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(
        `${elautBaseUrl}/unit-kerja/getAllUnitKerja`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setUnitKerjas(response.data.data || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  return { unitKerjas, loading, error, fetchUnitKerjaData }
}
