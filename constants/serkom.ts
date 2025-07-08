export type CertificateDescription = {
  desc_ind: string
  desc_eng: string
}

// HACCP: {
//   desc_ind:
//     'Dalam Pelatihan Hazard Analysis and Critical Control Points (HACCP) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan SDM Kelautan dan Perikanan (BPPSDMKP) dengan Pusat Mutu Pascapanen - Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPMHKP)',
//   desc_eng:
//     'In the Hazard Analysis and Critical Control Points (HACCP) Training, which was organized in collaboration between the Center for Marine and Fisheries Training - Marine and Fisheries Human Resource Development and Extension Agency, and the Center for Post-Harvest Quality Assurance - Marine and Fisheries Products Quality Control and Supervision Agency',
// },

// HACCP: {
//   desc_ind:
//     'Dalam Pelatihan Hazard Analysis and Critical Control Points (HACCP) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDM KP) melalui Badan Layanan Umum (BLU) Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Tegal dengan Pusat Pengendalian Mutu – Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPMHKP) dengan Jejaring Laboratorium Pengujian Penyakit dan Mutu Hasil Perikanan (JLPPMHP) Jawa Timur',
//   desc_eng:
//     'In the Hazard Analysis and Critical Control Points (HACCP) Training which was held in collaboration with the Marine and Fisheries Training Center – Marine and Fisheries Extension and Human Resources and Development Agency through the Public Service Agency Fisheries Training and Extension Center Tegal with the Quality Control Center – Quality Ontrol and Inspection Agency with the East Java Disease and Fishery Product Quality Testing Laboratory Network',
// },

export const DESC_CERTIFICATE_COMPETENCE_FISHERIES: Record<
  string,
  CertificateDescription
> = {
  HACCP: {
    desc_ind:
      'Dalam Pelatihan Hazard Analysis and Critical Control Points (HACCP) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDM KP) melalui Badan Layanan Umum (BLU) Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Tegal dengan Balai Pengembangan Penjaminan Mutu Pendidikan Vokasi Bidang Kelautan dan Perikanan, Teknologi Informasi dan Komunikasi Gowa Sulawesi Selatan',
    desc_eng:
      'In the Hazard Analysis and Critical Control Points (HACCP) Training held in collaboration between the Marine and Fisheries Training Center – the Agency for Marine and Fisheries Extension and Human Resources Development through the Public Service Agency of Fisheries Training and Extension Center Tegal with Center for Development of Quality Assurance for Vocational Education in the Field of Marine Affairs and Fisheries, Information and Comunication Technology Gowa South Sulawesi',
  },
  CBIB: {
    desc_ind:
      'Dalam Pelatihan Cara Budidaya Ikan yang Baik (CBIB) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Ikan Air Payau - Direktorat Jenderal Perikanan Budidaya dan Pusat Pengendalian dan Pengawasan Mutu Produksi Primer – Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPMHKP)',
    desc_eng:
      'In the Training on Good Aquaculture Practices (GAqPs) which was held in collaboration between the Center for Marine and Fisheries Training - Marine and Fisheries Human Resource Development and Extension Agency, the Directorate of Brackish Fish – Directorate General of Fisheries Cultivation, and the Center for Primary Production Quality Assurance - Marine and Fisheries Quality Control and Supervision Agency',
  },
  'MPM-CPIB': {
    desc_ind:
      'Dalam Pelatihan Manager Pengendali Mutu Cara Pembenihan Ikan yang Baik (MPM-CPIB) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Pembenihan - Direktorat Jenderal Perikanan Budidaya',
    desc_eng:
      'In the Quality Control Manager Training on Good Fish Hatchery Methods which was held in collaboration with the Center for Marine and Fisheries Training - Marine and Fisheries Human Resource Development and Extension Agency with the Directorate of Seeds - Directorate General of Aquaculture',
  },
  CPIB: {
    desc_ind:
      'Dalam Pelatihan Cara Pembenihan Ikan yang Baik (CPIB) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Rumput Laut - Direktorat Jenderal Perikanan Budidaya dan Pusat Pengendalian dan Pengawasan Mutu Produksi Primer – Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPMHKP)',
    desc_eng:
      'In the Training on Good Fish Breeding Practices which was held in collaboration between the Center for Marine and Fisheries Training - Marine and Fisheries Human Resource Development and Extension Agency, the Directorate of Seaweed - Directorate General of Fisheries Cultivation, and the Center for Primary Production Quality Assurance - Marine and Fisheries Quality Control and Supervision Agency',
  },
  CPOIB: {
    desc_ind:
      'Dalam Pelatihan Jaminan Mutu Obat Ikan, Kesehatan Ikan dan Lingkungan Budi Daya yang diselenggarakan atas kerjasama Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Jenderal Perikanan Budidaya dan Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPMHKP)',
    desc_eng:
      'In the Fish Medicine Quality Assurance Training, Fish Health and Aquaculture Environment held in collaboration with the Agency for Marine and Fisheries Extension and Human Resources Development with the Directorate General of Aquaculture and the Marine and Fisheries Product Quality Control and Supervision Agency',
  },
  CPPIB: {
    desc_ind:
      'Dalam Pelatihan Cara Pembuatan Pakan Ikan yang Baik (CPPIB) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Ikan Air Tawar - Direktorat Jenderal Perikanan Budidaya Pusat Pengendalian dan Pengawasan Mutu Produksi Primer – Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPMHKP)',
    desc_eng:
      'In the Training on Good Aquaculture Feed Manufacturing Practices which was held in collaboration between the Center for Marine and Fisheries Training - Marine and Fisheries Extension and Human Resources Development Agency, the Directorate of Freshwater Fish - Directorate General of Fisheries Cultivation, and the Center for Primary Production Quality Assurance - Marine and Fisheries Quality Control and Supervision Agency',
  },
  API: {
    desc_ind:
      'Dalam Pelatihan Asisten Pengolah Ikan (API) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Pengolahan - Direktorat Jenderal Penguatan Daya Saing Produk Kelautan dan Perikanan (DJPDSPKP) dan Pusat Mutu Pascapanen - Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPHMKP)',
    desc_eng:
      'In the Fish Processing Assistant Training which was held in  collaboration between the Center for Marine and Fisheries Training - Marine and Fisheries Extension and Human Resources Development Agency, the Directorate of Processing and Quality Development - Directorate General of Strengthening and Competitiveness of Marine and the Center for Post-Harvest Quality Assurance - Marine and Fisheries Products Quality Control and Supervision Agency',
  },
  SPI: {
    desc_ind:
      'Dalam Pelatihan Sertifikat Pengolah Ikan (SPI) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Pengolahan - Direktorat Jenderal Penguatan Daya Saing Produk Kelautan dan perikanan  (DJPDSPKP) dan Pusat Mutu Pascapanen - Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPMHKP)',
    desc_eng:
      'In the Fish Processing Assistant Training which was held in  collaboration with the Center for Marine and Fisheries Training - Marine and Fisheries Human Resource Development and Extension Agency with the Directorate of Processing and Quality Development - Directorate General of Strengthening and Competitiveness of Marine and Fishery Products',
  },
}

export const AKP_CERTIFICATIONS: string[] = [
  'ANKAPIN Tingkat I',
  'ATKAPIN Tingkat I',
  'ANKAPIN Tingkat II',
  'ATKAPIN Tingkat II',
  'ANKAPIN Tingkat III',
  'ATKAPIN Tingkat III',
  'BSTF I',
  'BSTF II',
  'Rating',
  'SKN',
  'SKPI',
  'SOPI',
  'Fishing Master',
  'Mesin Perikanan',
  'Penangkapan',
]

export const AQUACULTURE_CERTIFICATIONS: string[] = [
  'CPIB',
  'CBIB',
  'CPPIB',
  'HACCP',
  'MPM-CPIB',
  'SPI',
  'CPOIB',
  'API',
  'Budidaya',
  'Pengolahan dan Pemasaran',
  'Manajemen Perikanan',
  'SD Perikanan',
  'Wisata Bahari',
]

export const OCEAN_CERTIFICATIONS: string[] = [
  'BCL',
  'Pengelolaan Sampah',
  'Mitigasi Bencana',
  'Konservasi',
]
