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
  UjiKompetensi: string
  KoutaPelatihan: string // type from be, should be KuotaPelatihan
  AsalPelatihan: string
  JenisSertifikat: string
  TtdSertifikat: string
  NoSertifikat: string
  IdSaranaPrasarana: string
  IdKonsumsi: string
  CreatedAt: string
  UpdatedAt: string
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
  Program: string;
  JenisProgram: string;
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
  FileSertifikat?: string
  WaktuPembayaran: string
  NamaPelatihan: string
  DetailPelatihan: string
  BidangPelatihan: string
  Keterangan: string
  Nama: string
  TotalBayar: string
  TempatTanggalLahir: string
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
  IdSarpras: number;
  IdLemdik: number;
  NamaSarpras: string;
  Harga: number;
  Deskripsi: string;
  Jenis: string;
  CreatedAt: string;
  UpdatedAt: string;
};
