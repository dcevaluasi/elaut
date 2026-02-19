export interface P2MKP {
    IdPpmkp: number;
    nama_Ppmkp: string;
    nama_ppmkp: string;
    status_kepemilikan: string;
    nib: string;
    alamat: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan: string;
    kode_pos: string;
    no_telp: string;
    email: string;
    password: string;
    jenis_bidang_pelatihan: string;
    jenis_pelatihan: string;
    nama_penanggung_jawab: string;
    no_telp_penanggung_jawab: string;
    tempat_tanggal_lahir: string;
    jenis_kelamin: string;
    pendidikan_terakhir: string;
    dokumen_identifikasi_pemilik: string;
    dokumen_asesment_mandiri: string;
    dokument_surat_pernyataan: string;
    dokumen_keterangan_usaha: string;
    dokumen_afiliasi_parpol: string;
    dokumen_rekomendasi_dinas: string;
    dokumen_permohonan_pembentukan: string;
    dokumen_permohonan_klasifikasi: string;
    klasiikasi: string;
    skor_klasifikasi: string | number;
    tahun_penetapan: string;
    status_usaha: string;
    status_peltihan: string;
    bidang_pelatihan: string;
    is_lpk: string;
    status: string;
    create_at: string;
    update_at: string;
}

export interface PengajuanPenetapanP2MKP {
    IdPengajuanPenetapanPpmkp: string;
    id_Ppmkp: string;
    tahun_penetapan: string;
    nomor_surat: string;
    nomor_sertifikat: string;
    tanggal_surat: string;
    tanggal_sertifikat: string;
    status_usaha: string;
    status_pelatihan: string;
    is_lpk: string;
    status: string;
    create_at: string;
    update_at: string;
    // P2MKP Details (v-model or joined data)
    nama_Ppmkp?: string;
    nama_ppmkp?: string;
    kota?: string;
    provinsi?: string;
    nama_penanggung_jawab?: string;
}
