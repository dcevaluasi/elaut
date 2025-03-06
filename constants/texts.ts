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
}

type CertificateDescription = {
  title: string
  desc_ind: string
  desc_eng: string
}

export const DESC_CERTIFICATE: Record<string, CertificateDescription> = {
  HACCP: {
    title:
      'Apakah anda yakin ingin menyetujui penerbitan sttpl/sertifikat pelatihan ini?',
    desc_ind:
      'Dalam Pelatihan Hazzard Analysis and Critical Control Points (HACCP) yang diselenggarakan atas kerjasama Pusat Pelatihan Kelautan dan Perikanan - Badan Penyuluhan dan Pengembangan SDM Kelautan dan Perikanan (BPPSDMKP) dengan Pusat Pengendalian Mutu - Badan Pengendalian dan Pengawas Mutu Hasil Kelautan dan Perikanan (BPPMHKP) pada tanggal',
    desc_eng:
      'In the Hazard Analysis and Critical Control Points (HACCP) Training which was held in collaboration with the Maritime and Fisheries Training Center - Maritime and Fisheries Human Resource Development and Extension Agency with the Quality Control Center - Marine and Fisheries Products Quality Control and Supervision Agency on',
  },
}

export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase())
}
