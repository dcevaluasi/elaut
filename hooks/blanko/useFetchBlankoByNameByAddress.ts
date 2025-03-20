import { akapiBaseUrl } from '@/constants/urls'
import {
  DataBlankoByNameByAddress,
  SummaryDataBlankoByNameByAddress,
} from '@/types/akapi'
import axios, { AxiosResponse } from 'axios'
import React from 'react'

const useFetchBlankoByNameByAddress = (initialParams: {
  waktu_awal: string
  waktu_berakhir: string
  type_sertifikat?: string
  no_blanko?: string
  is_pembaruan?: string
}) => {
  const [params, setParams] = React.useState(initialParams)
  const [
    dataFull,
    setDataFull,
  ] = React.useState<SummaryDataBlankoByNameByAddress | null>(null)
  const [data, setData] = React.useState<DataBlankoByNameByAddress[]>([])
  const [isFetching, setIsFetching] = React.useState<boolean>(false)

  const fetchData = React.useCallback(async () => {
    setIsFetching(true)
    try {
      const response: AxiosResponse = await axios.get(
        `${akapiBaseUrl}/get-data-blanko`,
        {
          params: {
            ...params,
          },
        },
      )
      setDataFull(response.data)
      setData(response.data.data)
      console.log(response)
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetching(false)
    }
  }, [params])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = (newParams: Partial<typeof initialParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }))
  }

  return {
    data,
    dataFull,
    isFetching,
    refetch,
  }
}

export default useFetchBlankoByNameByAddress
