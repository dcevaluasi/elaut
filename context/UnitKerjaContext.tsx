"use client";

import { elautBaseUrl } from "@/constants/urls";
import { UnitKerja } from "@/types/master";
import axios from "axios";
import Cookies from "js-cookie";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UnitKerjaContextType {
    unitKerja: UnitKerja | null;
    loading: boolean;
    error: unknown;
}

const UnitKerjaContext = createContext<UnitKerjaContextType | undefined>(undefined);

export function UnitKerjaProvider({ children }: { children: React.ReactNode }) {
    const token = Cookies.get("XSRF091");
    const id = Cookies.get("IDUnitKerja");

    const [unitKerja, setUnitKerja] = useState<UnitKerja | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        // Guard: not logged in yet, so don't call the API
        if (!token || !id || id === "undefined") {
            setUnitKerja(null);
            return;
        }

        let cancelled = false;

        const fetchUnitKerjaData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(
                    `${elautBaseUrl}/unit-kerja/getUnitKerjaById?id=${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!cancelled) setUnitKerja(response.data.data || null);
            } catch (err) {
                if (!cancelled) setError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchUnitKerjaData();

        return () => {
            cancelled = true; // ignore results if token/id changes or the component unmounts
        };
    }, [token, id]);

    return (
        <UnitKerjaContext.Provider value={{ unitKerja, loading, error }}>
            {children}
        </UnitKerjaContext.Provider>
    );
}

export function useUnitKerja() {
    const ctx = useContext(UnitKerjaContext);
    if (!ctx) throw new Error("useUnitKerja must be used within UnitKerjaProvider");
    return ctx;
}