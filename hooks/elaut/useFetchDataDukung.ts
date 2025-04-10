import { useState, useEffect } from 'react'
import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { PengirimanSertifikat } from '@/types/blanko'
import { elautBaseUrl } from '@/constants/urls'
import { DataDukungPesertaPelatihan } from '@/types/pelatihan'

const useFetchDataDukung = () => {
  const [data, setData] = useState<DataDukungPesertaPelatihan[]>([])
  const [isFetching, setIsFetching] = useState<boolean>(false)

  const handleFetchDataDukung = async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/getDataDukung`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('XSRF091')}`,
          },
        },
      )
      setData(response.data.data)
      setIsFetching(false)
    } catch (error) {
      setIsFetching(false)
      throw error
    }
  }

  useEffect(() => {
    handleFetchDataDukung()
  }, [])

  return {
    data,
    isFetching,
    refetch: handleFetchDataDukung,
  }
}

export default useFetchDataDukung
