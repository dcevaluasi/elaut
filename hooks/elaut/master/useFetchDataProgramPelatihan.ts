// import { useState, useEffect, useCallback } from 'react'
// import axios from 'axios'
// import { elautBaseUrl } from '@/constants/urls'
// import { ProgramPelatihan } from '@/types/program'

// export const useFetchDataProgramPelatihan = () => {
//   const [data, setData] = useState<ProgramPelatihan[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchProgramPelatihan = useCallback(async () => {
//     setLoading(true)
//     setError(null)

//     try {
//       const res = await axios.get(
//         `${elautBaseUrl}/program_pelatihan/get_program_pelatihan`,
//       )
//       console.log({ res })
//       setData(res.data.data)
//     } catch (err) {
//       setError('Failed to fetch data')
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     fetchProgramPelatihan()
//   }, [])

//   return { data, loading, error, fetchProgramPelatihan }
// }

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { elautBaseUrl } from '@/constants/urls'
import { ProgramPelatihan } from '@/types/program'

export const useFetchDataProgramPelatihan = (filterName?: string) => {
  const [data, setData] = useState<ProgramPelatihan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgramPelatihan = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await axios.get(
        `${elautBaseUrl}/program_pelatihan/get_program_pelatihan`,
      )
      let fetchedData: ProgramPelatihan[] = res.data.data

      // Apply filter if filterName is provided
      if (filterName) {
        fetchedData = fetchedData.filter(
          (item) => item.name_indo === filterName,
        )
      }

      setData(fetchedData)
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [filterName])

  useEffect(() => {
    fetchProgramPelatihan()
  }, [fetchProgramPelatihan])

  return { data, loading, error, fetchProgramPelatihan }
}
