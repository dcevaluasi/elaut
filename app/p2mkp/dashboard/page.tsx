'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiAward } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DashboardLayout from './DashboardLayout';
import { HeaderPageLayoutAdminElaut } from '@/components/dashboard/Layouts/LayoutAdminElaut';
import Cookies from 'js-cookie';
import axios from 'axios';
import { elautBaseUrl } from '@/constants/urls';

export default function P2MKPDashboardPage() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = Cookies.get('XSRF091');
                if (token) {
                    const response = await axios.get(`${elautBaseUrl}/p2mkp/get_p2mkp_jwt`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (response.status === 200) {
                        setUserData(response.data.data || response.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Helper to check status safely
    const isApproved = userData?.Status === 'Approved' || userData?.status === 'Approved';

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-7xl mx-auto space-y-8 pb-20"
            >
                <HeaderPageLayoutAdminElaut
                    title="Selamat Datang, Admin P2MKP! 👋"
                    description="Pantau progress operasional dan manage standarisasi pelatihan mandiri Anda secara real-time."
                    icon={<FiActivity />}
                />

                {!loading && !isApproved && (
                    <div className="flex flex-wrap gap-4 mt-6">
                        <Link href="/p2mkp/dashboard/penetapan/pengajuan">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-xl font-bold tracking-wide shadow-lg shadow-blue-500/20 text-sm flex items-center gap-2 transition-all">
                                <FiAward size={18} />
                                AJUKAN PENETAPAN
                            </Button>
                        </Link>
                    </div>
                )}
                
                {/* Additional Dashboard Content can go here */}
                
            </motion.div>
        </DashboardLayout>
    );
}
