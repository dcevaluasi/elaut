export type ESELON = {
  abbrv: string
  fullName: string
  fullNameEng: string
  abbrvEselon: string
  fullNameEselon: string
}

export const KA_BPPSDM = 'Dr. I Nyoman Radiarta, S.Pi, M.Sc'
export const KA_PUSLAT_KP = 'Dr. Lilly Aprilya Pregiwati, S.Pi., M.Si'

export const ESELONS = {
  'Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan': {
    abbrv: 'Kepala BPPSDM KP',
    fullName:
      'Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan',
    fullNameEng:
      'Director General of The Agency for Marine and Fisheries Extension and Human Resources Development',
    abbrvEselon: 'BPPSDM KP',
    fullNameEselon:
      'Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan',
    currentPerson: 'Dr. I Nyoman Radiarta, S.Pi, M.Sc',
  },
  'Kepala Pusat Pelatihan Kelautan dan Perikanan': {
    abbrv: 'Kepala Puslat KP',
    fullName: 'Kepala Pusat Pelatihan Kelautan dan Perikanan',
    fullNameEng: 'Director for Marine And Fisheries Training Center',
    abbrvEselon: 'Puslat KP',
    fullNameEselon: 'Pusat Pelatihan Kelautan dan Perikanan',
    currentPerson: 'Dr. Lilly Aprilya Pregiwati, S.Pi., M.Si',
  },
  'Kepala Balai Pelatihan dan Penyuluhan Perikanan': {
    abbrv: 'Kepala BPPP',
    fullName: 'Kepala Balai Pelatihan dan Penyuluhan Perikanan',
    fullNameEng: 'Director for Fisheries Training and Extension Center',
    abbrvEselon: 'BPPP',
    fullNameEselon: 'Balai Pelatihan dan Penyuluhan Perikanan',
    currentPerson: 'Nama Kepala Balai Pelatihan dan Penyuluhan Perikanan',
  },
} as const

export type EselonKey = keyof typeof ESELONS

export const ESELON_1: ESELON = {
  abbrv: 'Kepala BPPSDM KP',
  fullName:
    'Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan',
  fullNameEng:
    'Chairman of The Agency for Marine and Fisheries Extension and Human Resources Development',
  abbrvEselon: 'BPPSDM KP',
  fullNameEselon:
    'Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan',
}

export const ESELON_2: ESELON = {
  abbrv: 'Kepala Puslat KP',
  fullName: 'Kepala Pusat Pelatihan Kelautan dan Perikanan',
  fullNameEng: 'Director for Marine And Fisheries Training Center',
  abbrvEselon: 'Puslat KP',
  fullNameEselon: 'Pusat Pelatihan Kelautan dan Perikanan',
}

export const ESELON_3: ESELON = {
  abbrv: 'Kepala BPPP',
  fullName: 'Kepala Balai Pelatihan dan Penyuluhan Perikanan',
  fullNameEng: 'Head of the Fisheries Training and Extension Center',
  abbrvEselon: 'BPPP',
  fullNameEselon: 'Balai Pelatihan dan Penyuluhan Perikanan',
}

export const UPT: string[] = [
  'Pusat Pelatihan Kelautan dan Perikanan',
  'Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Medan',
  'Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Tegal',
  'Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Banyuwangi',
  'Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Bitung',
  'Balai Pelatihan dan Penyuluhan Perikanan (BPPP) Ambon',
  'Politeknik KP Dumai',
  'Politeknik AUP Jakarta',
  'Politeknik KP Karawang',
  'Politeknik KP Pangandaran',
  'Politeknik KP Sidoarjo',
  'Politeknik KP Jembrana',
  'Politeknik KP Kurang',
  'Politeknik KP Bitung',
  'Politeknik KP Bone',
  'Politeknik KP Sorong',
  'AKP Wakatobi',
  'SUPM Ladong',
  'SUPM Pariaman',
  'SUPM Kota Agung',
  'SUPM Tegal',
  'SUPM Waiheru',
]

export const ESELON1 =
  'Kepala Badan Penyuluhan dan Pengembangan Sumber Daya Manusia Kelautan dan Perikanan'
export const ESELON2 = 'Kepala Pusat Pelatihan Kelautan dan Perikanan'
