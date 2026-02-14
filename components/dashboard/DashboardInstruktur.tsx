"use client";

import React, { useEffect } from "react";
import StatsInstruktur from "./Pelatihan/StatsInstruktur";
import { useFetchDataInstruktur } from "@/hooks/elaut/instruktur/useFetchDataInstruktur";
import { HashLoader } from "react-spinners";

export default function DashboardInstruktur() {
    const { instrukturs, loading, fetchInstrukturData, stats } = useFetchDataInstruktur();

    useEffect(() => {
        fetchInstrukturData();
    }, [fetchInstrukturData]);

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <HashLoader color="#338CF5" size={60} />
                    <p className="text-sm font-medium text-slate-600 animate-pulse">Loading data instruktur...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 py-6">
            <StatsInstruktur data={instrukturs} stats={stats} />
        </div>
    );
}
