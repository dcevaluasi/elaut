export const DIALOG_TEXTS = {
  'Approval Penerbitan Supervisor': {
    title:
      'Apakah anda yakin ingin menyetujui penerbitan sttpl/sertifikat pelatihan ini?',
    desc:
      'Sebelum melakukan tindakan ini dipastikan anda sudah melihat detail pelaksanaan pelatihan & data peserta pelatihan serta draft sertifikat yang diajukan penerbitannya!',
  },
  'Validasi Grouping Peserta': {
    title:
      'Apakah anda yakin ingin memvalidasi data peserta pelatihan secara grouping?',
    desc:
      'Sebelum melakukan tindakan ini dipastikan anda sudah melihat detail data peserta pelatihan dan pastikan data yang masuk merupakan data yang valid serta perlu diingat tindakan ini bersifat permanen dan tidak dapat diubah!',
  },
  'Sematkan No Sertifikat Grouping Peserta': {
    title:
      'Apakah anda yakin ingin menyematkan no sertifikat pada data peserta pelatihan secara grouping?',
    desc:
      'Sebelum melakukan tindakan ini dipastikan anda sudah membuat nomor di portal.kkp.go.id, nomor yang disematkan bukan berasal dari portal dianggap tidak valid!',
  },
  'Sematkan Tanggal Sertifikat Grouping Peserta': {
    title:
      'Apakah anda yakin ingin menyematkan tanggal sertifikat pada data peserta pelatihan secara grouping?',
    desc:
      'Sebelum melakukan tindakan ini dipastikan anda sudah berkoordinasi dengan tim terkait, karena pengaturan tanggal sertifikat hanya dapat dilakukan sekali!',
  },
  'Sematkan Spesimen Sertifikat Grouping Peserta': {
    title:
      'Apakah anda yakin ingin menyematkan spesimen TTD sertifikat pada data peserta pelatihan secara grouping?',
    desc:
      'Sebelum melakukan tindakan ini dipastikan anda sudah berkoordinasi dengan tim terkait, karena pengaturan spesimen sertifikat hanya dapat dilakukan sekali!',
  },
  'Layanan Call Center': {
    title: 'Layanan Pengaduan dan Informasi Pelatihan',
    desc:
      'Jika kamu mengalami kendala, gangguan, atau hal lainnya yang terjadi dalam penggunaan aplikasi E-LAUT, hubungi call center Pusat Pelatihan Kelautan dan Perikanan untuk mendapatkan solusi dan hubungi PTSP atau layanan informasi Balai Pelatihan KP terkait informasi pelaksanaan pelatihan, dll.',
  },
  'Cek Sertifikat': {
    title: 'Cek STTPL/Sertifikat Pelatihan',
    desc:
      'Masukkan no registrasi atau no peserta sobat E-LAUT untuk mengecek kevalidan data sertifikat dan keikutsertaan dalam pelatihan yang telah diselenggarakan!',
  },
}

type CertificateCurricullum = {
  name_ind: string
  name_eng: string
  theory: number
  practice: number
}

export const CURRICULLUM_CERTIFICATE: Record<
  string,
  Record<string, CertificateCurricullum[]>
> = {
  HACCP: {
    UMUM: [
      {
        name_ind: 'Kebijakan Sistem Jaminan Mutu dan Keamanan Hasil Perikanan',
        name_eng: 'Fishery Product Quality and Safety Assurance System Policy',
        theory: 2,
        practice: 0,
      },
    ],
    INTI: [
      {
        name_ind: 'Prinsip Kemunduran Mutu Ikan',
        name_eng: 'Principle of Decline in Fish Quality',
        theory: 2,
        practice: 2,
      },
      {
        name_ind:
          'Penerapan Persyaratan Kelayakan Dasar/Pre Requisite HACCP di UPI',
        name_eng:
          'Implementation of HACCP Basic/Pre Requisite Eligibility Requirements at UPI',
        theory: 2,
        practice: 2,
      },
      {
        name_ind: 'Pengembangan Penerapan Sistem HACCP',
        name_eng: 'Development of HACCP System Implementation',
        theory: 4,
        practice: 18,
      },
    ],
  },
}

export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}
