import { useState, useEffect } from 'react'
import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { UserPelatihan } from '@/types/product'

const useFetchDataDukung = () => {
  const [data, setData] = useState<UserPelatihan[]>([])
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const isPengelolaUPT = Cookies.get('Role') == 'Pengelola UPT'
  const nameLemdiklat = Cookies.get('Satker')

  const handleFetchDataDukung = async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${elautBaseUrl}/getUsersPelatihan`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('XSRF091')}`,
          },
        },
      )
      let filteredData: UserPelatihan[] = response.data.data.filter(
        (item: UserPelatihan) => item.FileSertifikat?.includes('signed'),
      )
      if (isPengelolaUPT) {
        filteredData = filteredData.filter(
          (item) => item.PenyelenggaraPelatihan === nameLemdiklat,
        )
      }
      setData(filteredData)

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
