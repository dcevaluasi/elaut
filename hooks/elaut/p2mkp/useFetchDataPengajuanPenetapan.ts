import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { elautBaseUrl } from '@/constants/urls'
import { PengajuanPenetapanP2MKP } from '@/types/p2mkp'

export const useFetchDataPengajuanPenetapan = () => {
    const [data, setData] = useState<PengajuanPenetapanP2MKP[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPengajuanData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const token = Cookies.get('XSRF091')
            const response = await axios.get(`${elautBaseUrl}/p2mkp/get_pengjuan_penetapan_p2mkp`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data && response.data.data) {
                setData(response.data.data)
            } else if (Array.isArray(response.data)) {
                setData(response.data)
            } else {
                setData([])
            }

        } catch (err: any) {
            console.error('Error fetching Pengajuan Penetapan data:', err)
            setError(err.message || 'Failed to fetch Pengajuan Penetapan data')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPengajuanData()
    }, [fetchPengajuanData])

    return { data, loading, error, fetchPengajuanData }
}
