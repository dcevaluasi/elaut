'use client'

import { elautBaseUrl } from '@/constants/urls'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useState } from 'react'

interface CreateNotePelatihanPayload {
  id_pelatihan: string
  email: string
  role: string
  catatan: string
}

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export function useCreateNotePelatihan() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<ApiResponse | null>(null)

  const createNotePelatihan = async (payload: CreateNotePelatihanPayload) => {
    setLoading(true)
    setError(null)

    try {
      const res = await axios.post(
        `${elautBaseUrl}/note-pelatihan/createNotePelatihan`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('XSRF091')}`,
            'Content-Type': 'application/json',
          },
        },
      )
      console.log({ res })
      const data = res.data
      setResponse({
        success: true,
        message: 'Note pelatihan berhasil dibuat',
        data,
      })
      return data
    } catch (err) {
      console.error({ err })
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createNotePelatihan,
    loading,
    error,
    response,
  }
}
