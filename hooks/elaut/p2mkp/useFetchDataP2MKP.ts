import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { P2MKP } from '@/types/p2mkp'

export const useFetchDataP2MKP = () => {
    const [data, setData] = useState<P2MKP[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchP2MKPData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const token = Cookies.get('XSRF091')
            const response = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data && response.data.data) {
                // Assuming the API returns { data: [...] } or just [...]
                // Adjust based on actual API response structure if needed.
                // Based on other hooks, it seems to be response.data.data often.
                setData(response.data.data)
            } else {
                setData([])
            }

        } catch (err: any) {
            console.error('Error fetching P2MKP data:', err)
            setError(err.message || 'Failed to fetch P2MKP data')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchP2MKPData()
    }, [fetchP2MKPData])

    return { data, loading, error, fetchP2MKPData }
}
