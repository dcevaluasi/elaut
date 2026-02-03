import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { P2MKP } from '@/types/p2mkp'

export const useFetchDataP2MKPById = (id: string | number) => {
    const [data, setData] = useState<P2MKP | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchP2MKPDataById = useCallback(async () => {
        if (!id) return;
        setLoading(true)
        setError(null)
        try {
            const token = Cookies.get('XSRF091')
            const response = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_by_id?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data) {
                // Check if data is nested
                if (response.data.data) {
                    setData(response.data.data)
                } else {
                    setData(response.data)
                }
            } else {
                setData(null)
            }

        } catch (err: any) {
            console.error('Error fetching P2MKP data by ID:', err)
            setError(err.message || 'Failed to fetch P2MKP data')
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        if (id) {
            fetchP2MKPDataById()
        }
    }, [fetchP2MKPDataById])

    return { data, loading, error, fetchP2MKPDataById }
}
