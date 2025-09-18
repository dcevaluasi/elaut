"use client";

import React, { useState } from "react";

import { formatDateTime } from "@/utils";

import { PelatihanMasyarakat } from "@/types/product";
import { UserPelatihan } from "@/types/user";
import TableDataPelatihanMasyarakat from "../tables/TableDataPelatihanMasyarakat";
import TableDataPelatihanMasyarakatByProvinsi from "../tables/TableDataPelatihanMasyarakatByProvinsi";
import TableDataPelatihanMasyrakatByProgramPrioritas from "../tables/TableDataPelatihanMasyrakatByProgramPrioritas";
import TableDataPelatihanMasyrakatByGender from "../tables/TableDataPelatihanMasyrakatByGender";
import TableDataPelatihanMasyrakatByPendidikan from "../tables/TableDataPelatihanMasyrakatByPendidikan";
import TableDataPelatihanMasyarakatByWilker from "../tables/TableDataPelatihanMasyarakatByWilker";
import Cookies from "js-cookie";

const TableDataIndikatorKinerjaUtama: React.FC<{
    data: PelatihanMasyarakat[];
    dataUser: UserPelatihan[];
}> = ({ data, dataUser }) => {

    const isAdminBalaiPelatihan = Cookies.get('XSRF093') == 'balai'
    const nameBalaiPelatihan = Cookies.get('Satker')

    const TrainingDashboard = () => {
        return (
            <div className="col-span-12  pb-5 pt-7.5   xl:col-span-5 w-full">
                <div className="mb-3 justify-between gap-4 sm:flex w-full">
                    <div>
                        <h5 className="text-xl font-semibold text-black">
                            Total Masyarakat Dilatih
                        </h5>
                        <p className="italic text-sm">{formatDateTime()}</p>
                    </div>
                </div>

                <TableDataPelatihanMasyarakat dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
                <TableDataPelatihanMasyarakatByProvinsi dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
                <TableDataPelatihanMasyrakatByProgramPrioritas dataPelatihan={isAdminBalaiPelatihan ? data.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : data} />
                <TableDataPelatihanMasyarakatByWilker dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
                <TableDataPelatihanMasyrakatByGender dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
                <TableDataPelatihanMasyrakatByPendidikan dataUserPelatihan={isAdminBalaiPelatihan ? dataUser.filter((item) => (isAdminBalaiPelatihan && item.PenyelenggaraPelatihan! == nameBalaiPelatihan)) : dataUser} />
            </div>
        );
    };

    return <TrainingDashboard />;
};

export default TableDataIndikatorKinerjaUtama;
