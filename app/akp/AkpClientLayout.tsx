"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/dashboard/common/Loader";

export default function AkpClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    return <div className="relative">{loading ? <Loader /> : children}</div>;
}
