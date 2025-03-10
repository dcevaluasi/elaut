export type CertificateDescription = {
  desc_ind: string
  desc_eng: string
}

export const DESC_CERTIFICATE_COMPETENCE_FISHERIES: Record<
  string,
  CertificateDescription
> = {
  HACCP: {
    desc_ind:
      'Dalam Pelatihan Hazzard Analysis and Critical Control Points (HACCP) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan SDM Kelautan dan Perikanan (BPPSDMKP) dengan Pusat Pengendalian dan Pengawasan Mutu Pascapanen - Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPMHKP) pada tanggal',
    desc_eng:
      'In the Hazard Analysis and Critical Control Points (HACCP) Training which was held in collaboration with the Maritime and Fisheries Training Center - Maritime and Fisheries Human Resource Development and Extension Agency with Postharvest Quality Control and Supervision Center - Marine and Fisheries Products Quality Control and Supervision Agency on',
  },
  CBIB: {
    desc_ind:
      'Dalam Pelatihan Cara Budidaya Ikan yang Baik (CBIB) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Produksi dan Usaha Budidaya - Direktorat Jenderal Perikanan Budidaya pada tanggal',
    desc_eng:
      'In the Training on Good Fish Cultivation Methods (CBIB) which was held in collaboration with the Maritime and Fisheries Training Center - Maritime and Fisheries Human Resource Development and Extension Agency with the Directorate of Production and Cultivation Business - Directorate General of Aquaculture on',
  },
  'MPM-CPIB': {
    desc_ind:
      'Dalam Pelatihan Manager Pengendali Mutu Cara Pembenihan Ikan yang Baik (MPM-CPIB) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Pembenihan - Direktorat Jenderal Perikanan Budidaya pada tanggal',
    desc_eng:
      'In the Quality Control Manager Training on Good Fish Hatchery Methods which was held in collaboration with the Maritime and Fisheries Training Center - Maritime and Fisheries Human Resource Development and Extension Agency with the Directorate of Seeds - Directorate General of Aquaculture on',
  },
  CPPIB: {
    desc_ind:
      'Dalam Pelatihan Cara Pembuatan Pakan Ikan yang Baik (CPPIB) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Pakan dan Obat Ikan - Direktorat Jenderal Perikanan Budidaya pada tanggal',
    desc_eng:
      'In the Training on Good Aquaculture Feed Manufacturing Practices which was held in collaboration with the Maritime and Fisheries Training Center - Maritime and Fisheries Human Resource Development and Extension Agency with the Directorate for Fish Feed and Aqua Medicine - Directorate General of Aquaculture on',
  },
  API: {
    desc_ind:
      'Dalam Pelatihan Asisten Pengolah Ikan (API) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan (BPPSDMKP) dengan Direktorat Pengolahan dan Bina Mutu - Direktorat Jenderal Penguatan Daya Saing Produk Kelautan dan perikanan pada tanggal',
    desc_eng:
      'In the Fish Processing Assistant Training which was held in  collaboration with the Maritime and Fisheries Training Center - Maritime and Fisheries Human Resource Development and Extension Agency with the Directorate of Processing and Quality Development - Directorate General of Strengthening and Competitiveness of Marine and Fishery Products on',
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
