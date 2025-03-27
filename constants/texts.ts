export const DIALOG_TEXTS = {
  'Approval Penerbitan Supervisor': {
    title:
      'Apakah anda yakin ingin menyetujui penerbitan sttpl/sertifikat pelatihan ini?',
    desc:
      'Sebelum melakukan tindakan ini dipastikan anda sudah melihat detail pelaksanaan pelatihan & data peserta pelatihan serta draft sertifikat yang diajukan penerbitannya!',
  },
  'History Pelatihan': {
    title: 'History Aktifitas Pelatihan',
    desc:
      'Lihat progress atau aktifitas dari pelaksanaan pelatihan yang diselenggarakan, scroll kebawah pada tabel untuk melihat lebih banyak',
  },
  'Validasi Grouping Peserta': {
    title:
      'Apakah anda yakin ingin memvalidasi data peserta pelatihan secara grouping?',
    desc:
      'Sebelum melakukan tindakan ini dipastikan anda sudah melihat detail data peserta pelatihan dan pastikan data yang masuk merupakan data yang valid serta perlu diingat tindakan ini bersifat permanen dan tidak dapat diubah!',
  },
  'Kelulusan Grouping Peserta': {
    title:
      'Apakah anda yakin ingin meluluskan peserta pelatihan secara keseluruhan?',
    desc:
      'Sebelum melakukan tindakan ini dipastikan anda sudah berkoordinasi dengan Supervisor/Pengawas/Penguji/Pelatih/Pembina untuk meluluskan seluruh peserta, jika terdapat peserta yang tidak lulus ketika telah diluluskan semua, anda dapat men-uncheck pada kolom LULUS/TIDAK LULUS di data peserta.',
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
  CBIB: {
    UMUM: [
      {
        name_ind: 'Kebijakan Penerapan SJMHKP dalam Perikanan Budidaya',
        name_eng: 'Fishery Product Quality and Safety Assurance System Policy',
        theory: 2,
        practice: 0,
      },
      {
        name_ind: 'Kebijakan Pembinaan Penerapan CBIB',
        name_eng: 'CBIB Implementation Guidance Policy',
        theory: 2,
        practice: 0,
      },
    ],
    INTI: [
      {
        name_ind: 'Bahaya Pangan, Persyaratan Internasional dan Nasional',
        name_eng: 'Food Hazards, International and National Requirements',
        theory: 1,
        practice: 2,
      },
      {
        name_ind: 'Persyaratan SNI CBIB Keamanan Pangan',
        name_eng: 'SNI CBIB Food Safety Requirements',
        theory: 3,
        practice: 6,
      },
      {
        name_ind:
          'Mekanisme Sistem Jaminan Mutu dan Keamanan Hasil perikanan Budidaya',
        name_eng:
          'Mechanism of Quality Assurance System and Safety of Aquaculture Products',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Pengelolaan Resiko Unit Budidaya',
        name_eng: 'Cultivation Unit Risk Management',
        theory: 2,
        practice: 4,
      },
      {
        name_ind: 'Pengelolaan Kesehatan Ikan dan Biosecurity',
        name_eng: 'Fish Health and Biosecurity Management',
        theory: 2,
        practice: 3,
      },
      {
        name_ind: 'Prosedur Pengendalian Proses Budidaya',
        name_eng: 'Cultivation Process Control Procedure',
        theory: 2,
        practice: 4,
      },
    ],
  },
  CPIB: {
    UMUM: [
      {
        name_ind: 'Kebijakan Penerapan SJMHKP dalam Perikanan Budidaya',
        name_eng: 'Policy on the Implementation of SJMHKP in Aquaculture',
        theory: 2,
        practice: 0,
      },
      {
        name_ind: 'Kebijakan Sistem Perbenihan Ikan Nasional',
        name_eng: 'National Fish Seed System Policy',
        theory: 2,
        practice: 0,
      },
    ],
    INTI: [
      {
        name_ind: 'Standarisasi dan Pembinaan Penerapan CPIB',
        name_eng: 'Standardization and Guidance on CPIB Implementation',
        theory: 1,
        practice: 2,
      },
      {
        name_ind: 'Persyaratan SNI CBIB Keamanan Pangan',
        name_eng: 'SNI CBIB Food Safety Requirements',
        theory: 3,
        practice: 6,
      },
      {
        name_ind: 'SNI CPIB',
        name_eng: 'Indonesian National Standard of CPIB',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Dokumentasi CPIB - Penilaian Mandiri Penerapan CPIB',
        name_eng: 'CPIB Documentation - CPIB Implementation Self-Assessment',
        theory: 2,
        practice: 4,
      },
      {
        name_ind:
          'Perizinan Berusaha Unit Pembenihan Terintegrasi Secara Elektronik',
        name_eng: 'Electronic Integrated Hatchery Unit Business License',
        theory: 2,
        practice: 3,
      },
    ],
  },
  CPPIB: {
    UMUM: [
      {
        name_ind: 'Kebijakan Penerapan SJMHKP dalam Perikanan Budidaya',
        name_eng: 'Policy on the Implementation of SJMHKP in Aquaculture',
        theory: 2,
        practice: 0,
      },
      {
        name_ind: 'Kebijakan Pemerintah Dalam Penerapan CPPIB',
        name_eng: 'Government Policy on CPPIB Implementation',
        theory: 2,
        practice: 0,
      },
    ],
    INTI: [
      {
        name_ind: 'Prinsip Penerapan CPPIB (Sistem Jaminan Mutu)',
        name_eng:
          'Principles of CPPIB Implementation (Quality Assurance System)',
        theory: 2,
        practice: 6,
      },
      {
        name_ind: 'SNI Bahan Baku dan Pakan Ikan',
        name_eng: 'SNI for raw materials and fish feed',
        theory: 4,
        practice: 4,
      },
      {
        name_ind: 'Penyusunan Dokumen Penerapan CPPIB',
        name_eng: 'Preparation of CPPIB implementation document',
        theory: 2,
        practice: 9,
      },
      {
        name_ind:
          'Perizinan berusaha terintegrasi terkait penerbitan  sertifikat  CPPIB',
        name_eng:
          'Integrated business licensing related to the issuance of CPPIB certificates',
        theory: 1,
        practice: 2,
      },
    ],
  },
  API: {
    UMUM: [
      {
        name_ind: 'Kebijakan Sistem Jaminan Mutu dan Keamanan Hasil Perikanan',
        name_eng: ' Fishery Product Quality and Safety Assurance System Policy',
        theory: 1,
        practice: 0,
      },
    ],
    INTI: [
      {
        name_ind:
          'Sertifikasi dalam Sistem Jaminan Mutu dan Keamanan Hasil Perikanan',
        name_eng:
          'Certification in Quality Assurance and Fishery Product Safety System',
        theory: 1,
        practice: 1,
      },
      {
        name_ind: 'Kemunduran Mutu Hasil Perikanan',
        name_eng: 'Quality Deterioration of Fishery Products',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Teknologi Penanganan Hasil Perikanan',
        name_eng: 'Fishery Product Handling Technology',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Teknologi Pengolahan Hasil Perikanan',
        name_eng: 'Fishery Product Processing Technology',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Teknologi Pengemasan dan Pelabelan',
        name_eng: 'Packaging and Labeling Technology',
        theory: 1,
        practice: 2,
      },
      {
        name_ind: 'Penerapan Good Manufacturing Practices (GMP)',
        name_eng: 'Good Manufacturing Practices (GMP) Implementation',
        theory: 2,
        practice: 0,
      },
      {
        name_ind: 'Penyusunan Program Penerapan GMP',
        name_eng: 'Preparation of GMP Implementation Program',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Penerapan Standard Sanitation Operating Procedure (SSOP)',
        name_eng:
          'Standard Sanitation Operating Procedure (SSOP) Implementation',
        theory: 2,
        practice: 0,
      },
      {
        name_ind: 'Penyusunan Program Pemenuhan Persyaratan SSOP',
        name_eng: 'Preparation of Program to Fulfill SSOP Requirements',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Penyusunan Panduan Mutu GMP dan SSOP',
        name_eng: 'Preparation of GMP and SSOP Quality Guidelines',
        theory: 2,
        practice: 8,
      },
    ],
  },
}

export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}
