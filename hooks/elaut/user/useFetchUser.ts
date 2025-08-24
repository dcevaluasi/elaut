import React from 'react'
import axios, { AxiosResponse } from 'axios'
import { User } from '@/types/user'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'

export const useFetchUser = () => {
  const token = Cookies.get('XSRF081')
  const [userDetail, setUserDetail] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchUser = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response: AxiosResponse<User> = await axios.get(
        `${elautBaseUrl}/users/getUsersById`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setUserDetail(response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching user detail:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { userDetail, isLoading, fetchUser }
}
