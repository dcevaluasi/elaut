import { elautBaseUrl } from "@/constants/urls";
import { UnitKerja } from "@/types/master";
import axios from "axios";
import Cookies from "js-cookie";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface UnitKerjaContextType {
    unitKerja: UnitKerja | null
    loading: boolean
    error: unknown
    fetchUnitKerjaData: () => Promise<void>
}

const UnitKerjaContext = createContext<UnitKerjaContextType | undefined>(undefined)

export function UnitKerjaProvider({ children }: { children: React.ReactNode }) {
    const token = Cookies.get('XSRF091')
    const id = Cookies.get('IDUnitKerja')

    const [unitKerja, setUnitKerja] = useState<UnitKerja | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const fetchUnitKerjaData = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await axios.get(`${elautBaseUrl}/unit-kerja/getUnitKerjaById?id=${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setUnitKerja(response.data.data || null)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [token, id])

    useEffect(() => {
        fetchUnitKerjaData()
    }, [])

    return (
        <UnitKerjaContext.Provider value={{ unitKerja, loading, error, fetchUnitKerjaData }}>
            {children}
        </UnitKerjaContext.Provider>
    )
}

export function useUnitKerja() {
    const ctx = useContext(UnitKerjaContext);
    if (!ctx) throw new Error("useUnitKerja must be used within UnitKerjaProvider");
    return ctx;
}