'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
    Loader2,
    Save,
    FileUp,
    ArrowLeft,
    LayoutDashboard,
    Award,
    X,
    Menu,
    Search,
    Bell,
    LogOut,
    User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
    DokumenIdentifikasiPemilik: z.string().min(1, "Wajib diunggah"),
    DokumenAsesmentMandiri: z.string().min(1, "Wajib diunggah"),
    DokumentSuratPernyataan: z.string().min(1, "Wajib diunggah"),
    DokumenKeteranganUsaha: z.string().min(1, "Wajib diunggah"),
    DokumenAfiliasiParpol: z.string().min(1, "Wajib diunggah"),
    DokumenRekomendasiDinas: z.string().min(1, "Wajib diunggah"),
    DokumenPermohonanPembentukan: z.string().min(1, "Wajib diunggah"),
    DokumenPermohonanKlasifikasi: z.string().min(1, "Wajib diunggah"),
    StatusUsaha: z.string().min(1, "Status usaha wajib diisi"),
    StatusPeltihan: z.string().min(1, "Status pelatihan wajib diisi"),
});

export default function PengajuanPenetapanPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Initial Resize Check
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsMobile(true);
                setIsSidebarOpen(false);
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        Cookies.remove('XSRF091');
        Cookies.remove('Access');
        router.push('/p2mkp/login');
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            DokumenIdentifikasiPemilik: '',
            DokumenAsesmentMandiri: '',
            DokumentSuratPernyataan: '',
            DokumenKeteranganUsaha: '',
            DokumenAfiliasiParpol: '',
            DokumenRekomendasiDinas: '',
            DokumenPermohonanPembentukan: '',
            DokumenPermohonanKlasifikasi: '',
            StatusUsaha: '',
            StatusPeltihan: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Submission Values:', values);

            Swal.fire({
                title: 'Pengajuan Berhasil!',
                text: 'Pengajuan penetapan P2MKP Anda telah dikirim.',
                icon: 'success',
                confirmButtonText: 'Kembali ke Dashboard',
                confirmButtonColor: '#3b82f6',
            }).then(() => {
                router.push('/p2mkp/dashboard/penetapan');
            });

        } catch (error) {
            console.error('Submission error:', error);
            Swal.fire({
                title: 'Gagal Mengirim',
                text: 'Terjadi kesalahan saat mengirim pengajuan.',
                icon: 'error',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#d33',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Header Sidebar */}
                    <div className="h-20 flex items-center px-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="font-bold text-xl">P</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg leading-none">P2MKP</h1>
                                <p className="text-xs text-slate-400">Dashboard Area</p>
                            </div>
                        </div>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-white/70 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1">
                        <NavItem href="/p2mkp/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
                        <NavItem href="/p2mkp/dashboard/penetapan" icon={<Award />} label="Penetapan P2MKP" active />
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden h-screen">
                {/* Header Top */}
                <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-neutral-100 rounded-lg lg:hidden">
                            <Menu className="w-6 h-6 text-neutral-600" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-neutral-400 text-sm">
                            <Link href="/p2mkp/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                            <span>/</span>
                            <span className="text-neutral-900 font-medium">Pengajuan Penetapan</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">


                        <div className="h-8 w-px bg-neutral-200 mx-1"></div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 hover:bg-neutral-50 p-1.5 rounded-full pl-3 transition-colors border border-transparent hover:border-neutral-200">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-semibold text-neutral-900 leading-none">Admin P2MKP</p>
                                        <p className="text-xs text-neutral-500 mt-1">Pengelola</p>
                                    </div>
                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">Profil</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">Pengaturan</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <Link href="/p2mkp/dashboard/penetapan">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900">Form Pengajuan Penetapan</h1>
                                <p className="text-neutral-500">Lengkapi dokumen dan informasi di bawah ini.</p>
                            </div>
                        </div>

                        <Card className="border-neutral-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Data & Dokumen Pengajuan</CardTitle>
                                <CardDescription>Pastikan seluruh dokumen yang diunggah valid dan jelas.</CardDescription>
                            </CardHeader>
                            <hr className="my-1 border-neutral-200" />
                            <CardContent className="pt-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                                        {/* Status Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="StatusUsaha"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Status Usaha</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih status usaha" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Aktif">Aktif</SelectItem>
                                                                <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                                                                <SelectItem value="Berkembang">Berkembang</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="StatusPeltihan"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Status Pelatihan</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih status pelatihan" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Aktif">Aktif</SelectItem>
                                                                <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                                                                <SelectItem value="Berkembang">Berkembang</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <hr className="my-2 border-dashed border-neutral-200" />

                                        {/* Documents Grid */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-neutral-900 uppercase tracking-wider">Kelengkapan Dokumen</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Helper function or map for documents could be cleaner, but explicit for now */}
                                                <FileUploadField form={form} name="DokumenIdentifikasiPemilik" label="Dokumen Identifikasi Pemilik" />
                                                <FileUploadField form={form} name="DokumenAsesmentMandiri" label="Dokumen Asesment Mandiri" />
                                                <FileUploadField form={form} name="DokumentSuratPernyataan" label="Dokumen Surat Pernyataan" />
                                                <FileUploadField form={form} name="DokumenKeteranganUsaha" label="Dokumen Keterangan Usaha" />
                                                <FileUploadField form={form} name="DokumenAfiliasiParpol" label="Dokumen Afiliasi Parpol" />
                                                <FileUploadField form={form} name="DokumenRekomendasiDinas" label="Dokumen Rekomendasi Dinas" />
                                                <FileUploadField form={form} name="DokumenPermohonanPembentukan" label="Dokumen Permohonan Pembentukan" />
                                                <FileUploadField form={form} name="DokumenPermohonanKlasifikasi" label="Dokumen Permohonan Klasifikasi" />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6 border-t border-neutral-100">
                                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Mengirim...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Kirim Pengajuan
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

// Components
function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                <span className="font-medium text-sm">{label}</span>
            </div>
        </Link>
    );
}

function FileUploadField({ form, name, label }: { form: any, name: string, label: string }) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-3">
                            <Input
                                placeholder="Upload file..."
                                readOnly
                                value={field.value || ''}
                                className="bg-neutral-50"
                            />
                            <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => {
                                // Mock upload click
                                field.onChange("mock_file_path.pdf");
                            }}>
                                <FileUp className="w-4 h-4" />
                            </Button>
                        </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                        Klik tombol untuk mengunggah.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
