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
      'Masukkan no STTPL sobat E-LAUT untuk mengecek kevalidan data sertifikat dan keikutsertaan dalam pelatihan yang telah diselenggarakan!',
  },
  'Hapus File Sertifikat': {
    title: 'Menghapus Draft File Sertifikat',
    desc: 'Anda yakin ingin menghapus draft file sertifikat?',
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
        name_eng: 'Principles of Fish Quality Deterioration',
        theory: 2,
        practice: 2,
      },
      {
        name_ind:
          'Penerapan Persyaratan Kelayakan Dasar/Pre Requisite HACCP di UPI',
        name_eng:
          'Implementation of HACCP Basic/Pre Requisite Eligibility Requirements at the Fishery Processing Unit (FPU)',
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
        name_eng:
          'Policy on the Implementation Fishery Product Quality and Safety Assurance System Policy in Aquaculture',
        theory: 2,
        practice: 0,
      },
      {
        name_ind: 'Kebijakan Pembinaan Penerapan CBIB',
        name_eng: 'GAqPs Implementation Guidance Policy',
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
        name_eng: 'Indonesian National Standard GAqPs Food Safety Requirements',
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
        name_eng:
          'Policy on the Implementation of Fishery Product Quality and Safety Assurance System in Aquaculture',
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
        name_ind:
          'Standarisasi dan Pembinaan Penerapan Good Fisheries Breeding Practices',
        name_eng:
          'Standardization and Guidance on Good Fisheries Breeding Practices Implementation',
        theory: 1,
        practice: 2,
      },
      {
        name_ind: 'Persyaratan SNI CPIB Keamanan Pangan',
        name_eng:
          'SNI Good Fisheries Breeding Practices Food Safety Requirements',
        theory: 3,
        practice: 6,
      },
      {
        name_ind: 'SNI CPIB',
        name_eng:
          'Indonesian National Standard of Good Fisheries Breeding Practices',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Dokumentasi CPIB - Penilaian Mandiri Penerapan CPIB',
        name_eng:
          'Good Fisheries Breeding Practices Documentation - Good Fisheries Breeding Practices Implementation Self-Assessment',
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
  'MPM-CPIB': {
    UMUM: [
      {
        name_ind: 'Kebijakan Penerapan SJMHKP dalam Perikanan Budidaya',
        name_eng:
          'Policy on the Implementation of Fishery Product Quality and Safety Assurance System in Aquaculture',
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
        name_eng: 'Standardization and Guidance on GHAP Implementation',
        theory: 2,
        practice: 2,
      },
      {
        name_ind: 'SNI CPIB',
        name_eng: 'Indonesian National Standard of GHAP',
        theory: 2,
        practice: 2,
      },
      {
        name_ind:
          'Dokumentasi CPIB - (Penyusunan Dokumen CPIB, Presentasi Kelompok, Penilaian Mandiri Penerapan CPIB)',
        name_eng:
          'GHAP Documentation - (GHAP Document Preparation, Group Presentation, Self-Assessment of GHAP Implementation)',
        theory: 4,
        practice: 10,
      },
      {
        name_ind:
          'Perizinan berusaha unit pembenihan terintegrasi secara elektronik (OSS) Bidang Pembenihan Ikan',
        name_eng:
          'Business licensing of integrated hatchery units electronically (OSS) Fish Hatchery Division',
        theory: 2,
        practice: 2,
      },
      {
        name_ind: 'Proses Sertifikasi CPIB',
        name_eng: 'Certification Process of GHAP',
        theory: 2,
        practice: 0,
      },
    ],
  },
  CPPIB: {
    UMUM: [
      {
        name_ind: 'Kebijakan Penerapan SJMHKP dalam Perikanan Budidaya',
        name_eng:
          'Policy on the Implementation of Fishery Product Quality and Safety Assurance System in Aquaculture',
        theory: 2,
        practice: 0,
      },
      {
        name_ind: 'Kebijakan Pemerintah Dalam Penerapan CPPIB',
        name_eng: 'Government Policy on GfMP Implementation',
        theory: 2,
        practice: 0,
      },
    ],
    INTI: [
      {
        name_ind: 'Prinsip Penerapan CPPIB (Sistem Jaminan Mutu)',
        name_eng:
          'Principles of GfMP Implementation (Quality Assurance System)',
        theory: 2,
        practice: 6,
      },
      {
        name_ind: 'SNI Bahan Baku dan Pakan Ikan',
        name_eng:
          'Indonesian National Standard for raw materials and fish feed',
        theory: 4,
        practice: 4,
      },
      {
        name_ind: 'Penyusunan Dokumen Penerapan CPPIB',
        name_eng: 'Preparation of GfMP implementation document',
        theory: 2,
        practice: 9,
      },
      {
        name_ind:
          'Perizinan berusaha terintegrasi terkait penerbitan  sertifikat CPPIB',
        name_eng:
          'Integrated business licensing related to the issuance of GfMP certificates',
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
  CPOIB: {
    UMUM: [
      {
        name_ind: 'Kebijakan Penerapan SJMHKP dalam Perikanan Budi Daya',
        name_eng:
          'Policy on Implementation of Quality Assurance Certification for Marine and Fishery Products in Aquaculture',
        theory: 2,
        practice: 0,
      },
      {
        name_ind:
          'Kebijakan Pembinaan Penerapan Cara Pembuatan Obat Ikan yang Baik',
        name_eng:
          'Policy for Guidance on Implementation of Good Fish Medicine Manufacturing Practices',
        theory: 2,
        practice: 0,
      },
      {
        name_ind:
          'Kebijakan Surveilance AMR dan Monitoring Residu Obat Ikan pada Perikanan  Budi Daya',
        name_eng:
          'Antimicrobial Resistance Surveillance Policy and Monitoring of Fish Drug Residues in Aquaculture',
        theory: 2,
        practice: 0,
      },
    ],
    INTI: [
      {
        name_ind: 'Prinsip-prinsip Cara Pembuatan Obat Ikan yang Baik (CPOIB)',
        name_eng: 'Principles of Good Fish Medicine Manufacturing Methods',
        theory: 3,
        practice: 5,
      },
      {
        name_ind: 'Prinsip-prinsip Cara Distribusi Obat Ikan yang Baik (CDOIB)',
        name_eng: 'Principles of Good Fish Medicine Distribution Methods',
        theory: 3,
        practice: 5,
      },
      {
        name_ind: 'Monitoring Residu Obat Ikan',
        name_eng: 'Fish Drug Residue Monitoring',
        theory: 2,
        practice: 3,
      },
      {
        name_ind:
          'Surveilance Antimikrobial Resistance pada Perikanan Budi Daya',
        name_eng: 'Surveillance of Antimicrobial Resistance in Aquaculture',
        theory: 2,
        practice: 3,
      },
      {
        name_ind: 'Sertifikasi Cara Pembuatan Obat Ikan Yang Baik',
        name_eng: 'Certification of Good Fish Medicine Manufacturing Practices',
        theory: 3,
        practice: 5,
      },
      {
        name_ind: 'Penggunaan Obat Herbal dalam Penanganan Penyakit Ikan',
        name_eng: 'Use of Herbal Medicine in Treating Fish Diseases',
        theory: 2,
        practice: 3,
      },
    ],
  },
  SPI: {
    UMUM: [
      {
        name_ind: 'Kebijakan Sistem Jaminan Mutu dan Keamanan Hasil Perikanan',
        name_eng: 'Fishery Product Quality and Safety Assurance System Policy',
        theory: 1,
        practice: 0,
      },
    ],
    INTI: [
      {
        name_ind: 'Kemunduran Mutu Hasil Perikanan',
        name_eng: 'Deterioration of the Quality of Fishery Products',
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
        practice: 3,
      },
      {
        name_ind: 'Inovasi dan Pengembangan Produk',
        name_eng: 'Product Innovation and Development',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Standarisasi Produk Perikanan dan Perikanan Non Pangan',
        name_eng: 'Standardization of Fishery and Non-Food Fishery Products',
        theory: 2,
        practice: 0,
      },
      {
        name_ind: 'Penerapan Good Manufacturing Practices (GMP)',
        name_eng: 'Implementation of Good Manufacturing Practices (GMP)',
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
          'Implementation of Standard Sanitation Operating Procedure (SSOP)',
        theory: 2,
        practice: 0,
      },
      {
        name_ind: 'Penyusunan Program Pemenuhan Persyaratan SSOP',
        name_eng: 'Preparation of a Program to Fulfill SSOP Requirements',
        theory: 1,
        practice: 3,
      },
      {
        name_ind: 'Penyusunan Panduan Mutu GMP dan SSOP',
        name_eng: 'Preparation of GMP and SSOP Quality Guidelines',
        theory: 3,
        practice: 8,
      },
      {
        name_ind: 'Pengenalan Sertifikat Kelayakan Pengolahan',
        name_eng: 'Introduction of Processing Eligibility Certificates',
        theory: 2,
        practice: 0,
      },
    ],
  },
}

export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}
