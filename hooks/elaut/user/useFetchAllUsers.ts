'use client'

import { useState, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { User } from '@/types/user'
import { elautBaseUrl } from '@/constants/urls'

export function useFetchAllUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const fetchUsers = useCallback(async () => {
    const token = Cookies.get('XSRF091') || Cookies.get('XSRF081')
    if (!token) {
      setError('Token authentication missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${elautBaseUrl}/lemdik/getAllUsers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Normalize array response format
      let rawData: User[] = []
      if (Array.isArray(response.data)) {
        rawData = response.data
      } else if (Array.isArray(response.data?.data)) {
        rawData = response.data.data
      } else if (Array.isArray(response.data?.users)) {
        rawData = response.data.users
      } else if (Array.isArray(response.data?.Users)) {
        rawData = response.data.Users
      }

      setUsers(rawData)
    } catch (err) {
      console.error('Error fetching all users:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  return { users, loading, error, fetchUsers }
}
