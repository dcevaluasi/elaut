"use client";

import React, { useEffect } from "react";
import StatsModulPelatihan from "./Dashboard/Modul/StatsModulPelatihan";
import { useFetchDataMateriPelatihanMasyarakat } from "@/hooks/elaut/modul/useFetchDataMateriPelatihanMasyarakat";
import { HashLoader } from "react-spinners";

export default function DashboardModul() {
    const { data, loading, fetchModulPelatihan, stats } = useFetchDataMateriPelatihanMasyarakat("Modul");

    useEffect(() => {
        fetchModulPelatihan();
    }, [fetchModulPelatihan]);

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <HashLoader color="#338CF5" size={60} />
                    <p className="text-sm font-medium text-slate-600 animate-pulse">Loading data modul...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 py-6">
            <StatsModulPelatihan data={data} stats={stats} />
        </div>
    );
}
