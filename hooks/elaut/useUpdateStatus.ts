'use client'

import { useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'

interface UpdateStatusOptions {
  idPelatihan: string
  statusPenerbitan: string
}

export function useUpdateStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (options: UpdateStatusOptions) => {
    setLoading(true)
    setError(null)

    const updateData = new FormData()
    updateData.append('StatusPenerbitan', options.statusPenerbitan)

    try {
      const res = await axios.put(
        `${elautBaseUrl}/lemdik/UpdatePelatihan?id=${options.idPelatihan}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('XSRF091')}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      console.log({ res })

      return { success: true, data: res.data }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle axios error with response from backend
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Gagal update pelatihan'

        setError(message)
        return { success: false, error: message }
      } else {
        // Handle non-axios error
        setError('Unexpected error occurred')
        return { success: false, error: 'Unexpected error occurred' }
      }
    } finally {
      setLoading(false)
    }
  }

  return { updateStatus, loading, error }
}
