'use client'

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BadgeCheck, Save, User } from "lucide-react";
import { UK_ESELON_1, UK_ESELON_2, UK_ESELON_3 } from "@/constants/unitkerja";

export default function InstrukturPage() {
    const [formData, setFormData] = useState({
        nama: "",
        id_lemdik: "",
        jenis_pelatih: "",
        jenjang_jabatan: "",
        bidang_keahlian: "",
        metodologi_pelatihan: "",
        pelatihan_pelatih: "",
        kompetensi_teknis: "",
        management_of_training: "",
        training_officer_course: "",
        link_data_dukung_sertifikat: "",
        status: "",
        pendidikkan_terakhir: "",
        eselonI: "",
        eselonII: "",
        no_telpon: "",
        email: "",
        nip: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: integrate with your API here
        console.log("Submitted Data:", formData);
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-900 to-blue-900 text-white">
            {/* gradient blobs */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/30 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-14">
                <header className="mb-10 flex flex-col items-start gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                        <BadgeCheck className="h-4 w-4 text-blue-300" />
                        <span className="text-xs font-medium text-blue-100">Instruktur</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">

                        Formulir Pendataan <span className="font-calsans bg-clip-text text-transparent bg-gradient-to-r leading-none pt-0 from-blue-500 to-teal-400">Instruktur</span>
                    </h1>
                    <p className="max-w-2xl text-sm md:text-base text-blue-100/80">
                        Silakan lengkapi data instruktur berikut.

                    </p>
                </header>

                {/* Glass card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
                >
                    <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                                <User className="h-5 w-5 text-blue-200" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold text-blue-100">
                                    Data Instruktur
                                </h2>
                                <p className="text-xs text-blue-100/70">Isi data sesuai berkas</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleSubmit as any}
                            className="bg-white/10 hover:bg-white/20 text-blue-100 border border-white/20"
                        >
                            <Save className="mr-2 h-4 w-4" /> Simpan
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* NAMA */}
                            <div>
                                <Label htmlFor="nama" className="text-blue-100">Nama</Label>
                                <Input
                                    id="nama"
                                    name="nama"
                                    placeholder="Nama lengkap instruktur"
                                    value={formData.nama}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>

                            <div>
                                <Label className="text-blue-100">Eselon I</Label>
                                <Select
                                    value={formData.eselonI}
                                    onValueChange={(v) => setFormData((p) => ({ ...p, eselonI: v }))}
                                >
                                    <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-blue-50">
                                        <SelectValue placeholder="Pilih Eselon I" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900/80 backdrop-blur-xl text-blue-50 border border-white/10 truncate">
                                        {
                                            UK_ESELON_1.map((eselon1, index) => (
                                                <SelectItem className='truncate' value={eselon1.name} key={eselon1.id}>{eselon1.name}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            {
                                formData.eselonI != '' && <div>
                                    <Label className="text-blue-100">Eselon II</Label>
                                    <Select
                                        value={formData.eselonII}
                                        onValueChange={(v) => setFormData((p) => ({ ...p, eselonII: v }))}
                                    >
                                        <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-blue-50">
                                            <SelectValue placeholder="Pilih Eselon II" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900/80 backdrop-blur-xl text-blue-50 border border-white/10 truncate">
                                            {UK_ESELON_2[formData.eselonI as keyof typeof UK_ESELON_2]?.map(
                                                (eselon2: string, index: number) => (
                                                    <SelectItem className="truncate" value={eselon2} key={index}>
                                                        {eselon2}
                                                    </SelectItem>
                                                )
                                            )}

                                        </SelectContent>
                                    </Select>
                                </div>
                            }

                            {
                                formData.eselonI == 'Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan' ? <div>
                                    <Label className="text-blue-100">Eselon II</Label>
                                    <Select
                                        value={formData.id_lemdik}
                                        onValueChange={(v) => setFormData((p) => ({ ...p, id_lemdik: v }))}
                                    >
                                        <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-blue-50">
                                            <SelectValue placeholder="Pilih Eselon II" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900/80 backdrop-blur-xl text-blue-50 border border-white/10 truncate">
                                            {UK_ESELON_3[formData.eselonI as keyof typeof UK_ESELON_3]?.map(
                                                (eselon2: string, index: number) => (
                                                    <SelectItem className="truncate" value={eselon2} key={index}>
                                                        {eselon2}
                                                    </SelectItem>
                                                )
                                            )}

                                        </SelectContent>
                                    </Select>
                                </div> : <div>
                                    <Label htmlFor="id_lemdik" className="text-blue-100">Satuan Kerja</Label>
                                    <Input
                                        id="id_lemdik"
                                        name="id_lemdik"
                                        type="number"
                                        placeholder="Masukkan Unit Kerja"
                                        value={formData.id_lemdik}
                                        onChange={handleChange}
                                        className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                    />
                                </div>
                            }

                            {/* PANGKAT/GOLONGAN */}
                            <div>
                                <Label htmlFor="status" className="text-blue-100">Pangkat/Golongan</Label>
                                <Input
                                    id="status"
                                    name="status"
                                    placeholder="Contoh: Pembina IV A"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>

                            {/* JENJANG JABATAN */}
                            <div>
                                <Label htmlFor="jenjang_jabatan" className="text-blue-100">Jabatan</Label>
                                <Input
                                    id="jenjang_jabatan"
                                    name="jenjang_jabatan"
                                    placeholder="Contoh: Ahli Madya"
                                    value={formData.jenjang_jabatan}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>

                            {/* NIP */}
                            <div>
                                <Label htmlFor="nip" className="text-blue-100">NIP</Label>
                                <Input
                                    id="nip"
                                    name="nip"
                                    placeholder="Contoh: 1602000XXXX"
                                    value={formData.nip}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>

                            {/* EMAIL */}
                            <div>
                                <Label htmlFor="email" className="text-blue-100">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="Contoh: @kkp.go.id"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>

                            {/* NO TELPON */}
                            <div>
                                <Label htmlFor="no_telpon" className="text-blue-100">No Telpon</Label>
                                <Input
                                    id="no_telpon"
                                    name="no_telpon"
                                    placeholder="Contoh: 62821XXXXX"
                                    value={formData.no_telpon}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>

                            {/* BIDANG KEAHLIAN */}
                            <div className="md:col-span-2">
                                <Label htmlFor="bidang_keahlian" className="text-blue-100">Bidang Keahlian</Label>
                                <Input
                                    id="bidang_keahlian"
                                    name="bidang_keahlian"
                                    placeholder="Masukkan bidang keahlian utama"
                                    value={formData.bidang_keahlian}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>

                            {/* MOT & TOC */}
                            <div>
                                <Label htmlFor="management_of_training" className="text-blue-100">Sertifikat Management of Training (MoT)</Label>
                                <Input
                                    id="management_of_training"
                                    name="management_of_training"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.management_of_training}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>

                            <div>
                                <Label htmlFor="training_officer_course" className="text-blue-100">Sertifikat Training of Trainer (ToT)</Label>
                                <Input
                                    id="training_officer_course"
                                    name="training_officer_course"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.training_officer_course}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>

                            {/* LINK DATA DUKUNG */}
                            <div className="md:col-span-2">
                                <Label htmlFor="link_data_dukung_sertifikat" className="text-blue-100">
                                    Sertifikat Keahlian/Kompetensi
                                </Label>
                                <Input
                                    id="link_data_dukung_sertifikat"
                                    name="link_data_dukung_sertifikat"
                                    placeholder="https://drive.google.com/..."
                                    value={formData.link_data_dukung_sertifikat}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>



                            {/* PENDIDIKKAN TERAKHIR */}
                            <div>
                                <Label htmlFor="pendidikkan_terakhir" className="text-blue-100">Pendidikan Terakhir</Label>
                                <Input
                                    id="pendidikkan_terakhir"
                                    name="pendidikkan_terakhir"
                                    placeholder="Contoh: S1 Teknik"
                                    value={formData.pendidikkan_terakhir}
                                    onChange={handleChange}
                                    className="mt-2 bg-white/5 border-white/20 text-blue-50 placeholder:text-blue-200/50"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-blue-200 hover:bg-white/10"
                                onClick={() => setFormData({
                                    nama: "",
                                    id_lemdik: "",
                                    jenis_pelatih: "",
                                    jenjang_jabatan: "",
                                    bidang_keahlian: "",
                                    metodologi_pelatihan: "",
                                    pelatihan_pelatih: "",
                                    kompetensi_teknis: "",
                                    management_of_training: "",
                                    training_officer_course: "",
                                    link_data_dukung_sertifikat: "",
                                    status: "",
                                    pendidikkan_terakhir: "",
                                    eselonI: "",
                                    eselonII: "",
                                    no_telpon: "",
                                    email: "",
                                    nip: "",
                                })}
                            >
                                Reset
                            </Button>
                            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                                <Save className="mr-2 h-4 w-4" /> Simpan Data
                            </Button>
                        </div>
                    </form>
                </motion.div>

                {/* footer */}
                <footer className="mt-8 text-center text-xs text-blue-100/70">
                    © {new Date().getFullYear()} BPPSDM KP
                </footer>
            </div>
        </div>
    );
}
