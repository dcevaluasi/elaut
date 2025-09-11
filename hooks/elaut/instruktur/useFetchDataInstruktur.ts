'use client'

import { useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { Instruktur } from '@/types/instruktur'

export type CountStats = {
  bidangKeahlian: Record<string, number>
  jenjangJabatan: Record<string, number>
  pendidikanTerakhir: Record<string, number>
}

export function useFetchDataInstruktur() {
  const [instrukturs, setInstrukturs] = useState<Instruktur[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const token = Cookies.get('XSRF091')

  const fetchInstrukturData = useCallback(async () => {
    if (!token) {
      setError('Token is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get<Instruktur[]>(
        `${elautBaseUrl}/getInstrukturs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setInstrukturs(response.data || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  const stats: CountStats = useMemo(() => {
    const bidangKeahlian: Record<string, number> = {}
    const jenjangJabatan: Record<string, number> = {}
    const pendidikanTerakhir: Record<string, number> = {}

    instrukturs.forEach((i) => {
      if (i.bidang_keahlian) {
        bidangKeahlian[i.bidang_keahlian] =
          (bidangKeahlian[i.bidang_keahlian] || 0) + 1
      }
      if (i.jenjang_jabatan) {
        jenjangJabatan[i.jenjang_jabatan] =
          (jenjangJabatan[i.jenjang_jabatan] || 0) + 1
      }
      if (i.pendidikkan_terakhir) {
        pendidikanTerakhir[i.pendidikkan_terakhir] =
          (pendidikanTerakhir[i.pendidikkan_terakhir] || 0) + 1
      }
    })

    return { bidangKeahlian, jenjangJabatan, pendidikanTerakhir }
  }, [instrukturs])

  return { instrukturs, loading, error, fetchInstrukturData, stats }
}
