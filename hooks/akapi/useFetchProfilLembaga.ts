import React from 'react'
import axios, { AxiosResponse } from 'axios'
import { akapiBaseUrl } from '@/constants/urls'
import { DataProfilLembaga, SummaryDataProfilLembaga } from '@/types/akapi'

const useFetchProfilLembaga = () => {
  const [data, setData] = React.useState<DataProfilLembaga[]>([])
  const [
    dataFull,
    setDataFull,
  ] = React.useState<SummaryDataProfilLembaga | null>(null)

  const [isFetching, setIsFetching] = React.useState<boolean>(false)

  const handleFetchProfilLembaga = async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${akapiBaseUrl}/get-data-profile-lembaga`,
      )
      setData(response.data.data)
      setDataFull(response.data)
      setIsFetching(false)
    } catch (error) {
      setIsFetching(false)
      throw error
    }
  }

  React.useEffect(() => {
    handleFetchProfilLembaga()
  }, [])

  return {
    data,
    dataFull,
    isFetching,
    refetch: handleFetchProfilLembaga,
  }
}

export default useFetchProfilLembaga
