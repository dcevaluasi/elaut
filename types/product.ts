export type Product = {
  image: string
  name: string
  category: string
  price: number
  sold: number
  profit: number
}

export type SoalPelatihan = {
  IdSoalUjian: number
  IdLemdik: number
  IdPelatihan: number
  Soal: string
  JawabanBenar: string
  Status: string
  CreatedAt: string
  UpdateAt: string
  Jawaban: JawabanSoalPelatihan[]
}

export type JawabanSoalPelatihan = {
  IdJawaban: number
  IdSoalUjian: number
  NameJawaban: string
  Status: string
  CreateAt: string
  UpdateAt: string
}

export type PelatihanMasyarakat = {
  TanggalAkhirPendaftaran?: string
  IdPelatihan: number
  IdLemdik: string
  KodePelatihan: string
  NamaPelatihan: string
  PenyelenggaraPelatihan: string
  DetailPelatihan: string
  JenisPelatihan: string
  BidangPelatihan: string
  DukunganProgramTerobosan: string
  DeskripsiSertifikat: string
  TanggalMulaiPelatihan: string
  NamaPelathanInggris: string
  TanggalBerakhirPelatihan: string
  HargaPelatihan: number
  Instruktur: string
  FotoPelatihan: string
  Status: string
  MemoPusat: string
  SilabusPelatihan: string
  LokasiPelatihan: string
  JumlahPeserta?: number
  PelaksanaanPelatihan: string
  UjiKompotensi: string
  KoutaPelatihan: string // type from be, should be KuotaPelatihan
  AsalPelatihan: string
  JenisSertifikat: string
  TtdSertifikat: string
  NoSertifikat: string
  IdSaranaPrasarana: string
  IdKonsumsi: string
  CreateAt: string
  UpdateAt: string
  SuratPemberitahuan: string
  StatusPenerbitan: string
  UserPelatihan: UserPelatihan[]
  MateriPelatihan: MateriPelatihan[]
  SarprasPelatihan: Sarpras[]
  KeteranganTandaTangan?: string
  BeritaAcara: string
  CatatanPenerbitanByPusat: string
  StatusApproval: string
  PenerbitanSertifikatDiterima: string
  TanggalMulaiPendaftaran: string
  TanggalBerakhirPendaftaran: string
  PemberitahuanDiterima: string
  Program: string
  JenisProgram: string
  IsSematkan: string
  IsMengajukanPenerbitan?: string
}

export type DetailPelatihanMasyarakat = {
  IdPelatihan: number
  IdLemdik: string
  KodePelatihan: string
  NamaPelatihan: string
  PenyelenggaraPelatihan: string
  DetailPelatihan: string
  JenisPelatihan: string
  BidangPelatihan: string
  DukunganProgramTerobosan: string
  DeskripsiSertifikat: string
  TanggalMulaiPelatihan: string
  TanggalBerakhirPelatihan: string
  HargaPelatihan: number
  Instruktur: string
  FotoPelatihan: string
  Status: string
  MemoPusat: string
  SilabusPelatihan: string
  LokasiPelatihan: string
  PelaksanaanPelatihan: string
  UjiKompotensi: string
  KoutaPelatihan: string // type from be, should be KuotaPelatihan
  AsalPelatihan: string
  JenisSertifikat: string
  TtdSertifikat: string
  NoSertifikat: string
  IdSaranaPrasarana: string
  IdKonsumsi: string
  CreateAt: string
  UpdateAt: string
  SuratPemberitahuan: string
  StatusPenerbitan: string
  UserPelatihan: UserPelatihan[]
  MateriPelatihan: MateriPelatihan[]
  SarprasPelatihan: Sarpras[]
  BeritaAcara: string
  CatatanPenerbitanByPusat: string
  StatusApproval: string
  PenerbitanSertifikatDiterima: string
  TanggalMulaiPendaftaran: string
  TanggalAkhirPendaftaran: string
  PemberitahuanDiterima: string
  Program: string
  JenisProgram: string
  IsSematkan: string
}

export type UjiKompetensi = {
  IdUjikom: number
  IdLemdik: string
  KodeUjikom: string
  NamaUjikom: string
  PenyelenggaraUjikom: string
  DetailUjikom: string
  JenisUjikom: string
  BidangUjikom: string
  DukunganProgramTerobosan: string
  TanggalMulaiUjikom: string
  TanggalBerakhirUjikom: string
  HargaUjikom: string
  Instruktur: string
  FotoUjikom: string
  Status: string
  MemoPusat: string
  SilabusUjikom: string
  LokasiUjikom: string
  PelaksanaanUjikom: string
  UjiKompetensi: string
  KoutaUjikom: string // type from be, should be KuotaUjikom
  AsalUjikom: string
  JenisSertifikat: string
  TtdSertifikat: string
  NoSertifikat: string
  IdSaranaPrasarana: string
  IdKonsumsi: string
  CreatedAt: string
  UpdatedAt: string
  UserUjikom: UserUjikom[]
  MateriUjikom: MateriUjikom[]
  BeritaAcara: string
  CatatanPenerbitanByPusat: string
  StatusApproval: string
  PenerbitanSertifikatDiterima: string
}

export type MateriPelatihan = {
  CreateAt: string
  Deskripsi: string
  IdMateriPelatihan: number
  IdPelatihan: number
  JamPraktek: string
  JamTeory: string
  NamaMateri: string
  UpdateAt: string
}

export type MateriUjikom = {
  CreateAt: string
  Deskripsi: string
  IdMateriPelatihan: number
  IdPelatihan: number
  JamPraktek: string
  JamTeory: string
  NamaMateri: string
  UpdateAt: string
}

export type UserUjikom = {
  CreatedAt: string
  IdUserPelatihan: number
  IdPelatihan: number
  IdUsers: number
  IsActice: string
  IsKeterangan: string
  MetodoPembayaran: string
  NilaiPraktek: number
  NilaiTeory: number
  NoRegistrasi: string
  NoSertifikat: string
  PostTest: number
  PreTest: number
  StatusPembayaran: string
  UpdateAt: string
  WaktuPembayaran: string
  NamaPelatihan: string
  DetailPelatihan: string
  BidangPelatihan: string
  Keterangan: string
  Nama: string
  TotalBayar: string
  TempatTanggalLahir: string
}

export type UserPelatihan = {
  CreatedAt: string
  CreteAt: string
  IdUserPelatihan: number
  IdPelatihan: number
  FileSertifikat: string
  BuktiBayar: string
  IdUsers: number
  IsActice: string
  PenyelenggaraPelatihan: string
  TanggalMulai: string
  TanggalBerakhir: string
  PendidikanTerakhir: string
  IsKeterangan: string
  MetodoPembayaran: string
  NilaiPraktek: number
  NilaiTeory: number
  NoRegistrasi: string
  NoSertifikat: string
  TanggalSertifikat: string
  PostTest: number
  PreTest: number
  JenisKelamin: string
  StatusPembayaran: string
  UpdateAt: string
  WaktuPembayaran: string
  NamaPelatihan: string
  DetailPelatihan: string
  BidangPelatihan: string
  Keterangan: string
  Nama: string
  TotalBayar: string
  CodeAksess: string
  Provinsi: string
  TempatTanggalLahir: string
  JenisProgram: string
  StatusAproval: string
  Program: string
  DukunganProgramPrioritas: string
  StatusPenandatangan: string
}

export type Pelatihan = {
  IdPelatihan: number
  IdLemdik: number
  KodePelatihan: string
  NamaPelatihan: string
  PenyelenggaraPelatihan: string
  DetailPelatihan: string
  FotoPelatihan: string
  JenisPelatihan: string
  BidangPelatihan: string
  DukunganProgramTerobosan: string
  TanggalMulaiTerobosan: string
  TanggalBerakhirTerobosan: string
  HargaPelatihan: number
  Instruktur: string
  Status: string
  MemoPusat: string
  SilabusPelatihan: string
  PelaksanaanPelatihan: string
  UjiKompotensi: number
  KoutaPelatihan: number
  AsalPelatihan: string
  AsalSertifikat: string
  JenisSertifikat: string
  TtdSertifikat: string
  NoSertifikat: string
  StatusApproval: string
  IdSaranaPrasarana: number
  IdKonsumsi: string
  ModuleMateri: string
  KeteranganTandaTangan?: string
  CreateAt: string
  UpdateAt: string
  PemberitahuanDiterima: string
  SuratPemberitahuan: string
  CatatanPemberitahuanByPusat: string
  PenerbitanSertifikatDiterima: string
  BeritaAcara: string
  CatatanPenerbitanByPusat: string
  SarprasPelatihan: string
  MateriPelatihan: string
}

export type Sarpras = {
  IdSarpras: number
  IdLemdik: number
  NamaSarpras: string
  Harga: number
  Deskripsi: string
  Jenis: string
  CreatedAt: string
  UpdatedAt: string
}

export type BalaiPelatihanBank = {
  id_lemdik: number
  lemdik: string
  virtual_account_bank: string
  nama_bank: string
  nama_virtual_account_bank: string
}

export type ManningAgent = {
  IdManingAgent: number
  NamaManingAgent: string
  NoTelpon: number
  NamaPenanggungJawab: string
  Email: string
  Password: string
  Alamat: string
  Status: string
  CreateAt: string
  UpdateAt: string
  ManingAgentPelatihan: ManningAgentPelatihan[]
}

export type ManningAgentPelatihan = {
  IdMiningAgentPelatihan: number
  IdManingAgent: number
  IdPelatihan: string
  NamaPelatihan: string
  BidangPelatihan: string
  DetailPelatihan: string
  TanggalMulai: string
  TanggalBerakhir: string
  StatusAproval: string
  MetodePembayaran: string
  WaktuPembayaran: string
  Keterangan: string
  IsActice: string
  TotalBayar: string
  CreteAt: string
  UpdateAt: string
  NoVaBayar: string
  JumlahPeserta: string
  BuktiBayar: string
  Kode_billing_pelatihan: string
  Kode_billing_sarpras: string
  ManningAgentUsers: ManningAgentUsers[]
}

export type ManningAgentUsers = {
  Agama: string
  Alamat: string
  CreateAt: string
  Email: string
  Foto: string
  GolonganDarah: string
  IbuKandung: string
  IdManningAgentUsers: number
  IdMiningAgentPelatihan: number
  Ijazah: string
  JenisKelamin: string
  KK: string
  Kewarganegaraan: string
  Kota: string
  Ktp: string
  KusukaUsers: string
  Nama: string
  NegaraTujuanBekerja: string
  Nik: string
  NoTelpon: string
  Password: string
  Pekerjaan: string
  PendidikanTerakhir: string
  Provinsi: string
  Status: string
  StatusMenika: string
  SuratKesehatan: string
  TanggalLahir: string
  TempatLahir: string
  UpdateAt: string
}

export type HistoryTraining = {
  historical: HistoryItem[]
  status: string
}

export type HistoryItem = {
  id: string
  role: string
  notes: string
  upt: string
  created_at: string
}

export type DataInformationSISJAMUTraining = {
  id: string
  naming: {
    name_ind: string
    name_eng: string
  }
  poltek: InformationSISJAMUTraining
  supm: InformationSISJAMUTraining
}

export type InformationSISJAMUTraining = {
  allocation_time: string
  desc: {
    desc_eng: string
    desc_ind: string
  }
  general_competence: {
    name: string
    english_name: string
    theory_time: string
    practice_time: string
  }[]
  main_competence: {
    name: string
    english_name: string
    theory_time: string
    practice_time: string
  }[]
}
