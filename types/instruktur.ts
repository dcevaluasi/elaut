export type Instruktur = {
  IdInstruktur: number
  nama: string
  id_lemdik: number
  jenis_pelatih: string
  jenjang_jabatan: string
  jenis_sisjamu: string
  bidang_keahlian: string
  metodologi_pelatihan: string
  pelatihan_pelatih: string
  kompetensi_teknis: string
  management_of_training: string
  training_officer_course: string
  link_data_dukung_sertifikat: string
  status: string
  create_at: string
  update_at: string
  pendidikkan_terakhir: string
  no_telpon: string
  email: string
  nip: string
  eselon_1: string
  eselon_2: string
  /** Pangkat/golongan. Nama field mengikuti tag JSON backend yang berhuruf besar. */
  Golongan: string
  /** Instruktur, Widyaiswara, atau Pelatih non Instruktur. */
  label: string
  /** Instruktur UPT, Widyaiswara UPT, Instruktur Pusat, Widyaiswara Pusat. */
  jenis_label: string
}

/**
 * Bentuk respons `GET /instruktur/nip/:nip` — dipakai Portal Instruktur.
 * Lebih sempit daripada `Instruktur`: kolom sistem (`IdInstruktur`, `create_at`)
 * tidak dibuka, dan nama unit kerja ikut dikirim karena portal tidak boleh
 * memanggil endpoint unit kerja yang menuntut token admin.
 */
export type ProfilInstrukturPortal = Omit<
  Instruktur,
  'IdInstruktur' | 'create_at'
> & {
  unit_kerja: string
}
