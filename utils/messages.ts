import { generateTanggalPelatihan, getStatusInfo } from './text'

export function generatePelatihanMessage(pelatihan: any, status: string) {
  const statusInfo = getStatusInfo(status)

  // Optional: Customize greetings or instructions based on status label
  const statusLabel = statusInfo.label.toUpperCase()
  const statusTitle = `[[ ${statusLabel} ]]`

  let instruction = ''
  switch (status) {
    case '1': // Pending SPV
      instruction =
        'Harap untuk segera mengecek permohonan pelaksanaan pelatihan dan menunjuk *Verifikator* untuk melakukan verifikasi lebih lanjut melalui kanal berikut:'
      break
    case '2': // Pending Verifikator
      instruction =
        'Harap untuk segera melakukan verifikasi permohonan pelaksanaan pelatihan melalui kanal berikut:'
      break
    case '4': // Approved Pelaksanaan
      instruction =
        'Permohonan pelaksanaan pelatihan telah *disetujui*. Silakan lanjut ke tahap berikut melalui kanal berikut:'
      break
    case '7A': // Pending Kabalai
      instruction =
        'Harap untuk segera melakukan pengecekan dan persetujuan pelaksanaan pelatihan melalui kanal berikut:'
      break
    case '8': // Pending Kapus
      instruction =
        'Harap untuk segera melakukan verifikasi dan persetujuan STTPL melalui kanal berikut:'
      break
    case '12': // Pending Kabadan
      instruction =
        'Harap untuk segera memeriksa dan menyetujui STTPL yang telah diajukan melalui kanal berikut:'
      break
    default:
      instruction =
        'Silakan cek status pelaksanaan pelatihan melalui kanal berikut:'
  }

  const message = `${statusTitle}
HALO PENGELOLA APLIKASI E-LAUT 💦⛴!

Telah masuk informasi pelaksanaan pelatihan dengan detail sebagai berikut:

- Nama Pelatihan : ${pelatihan?.NamaPelatihan}
- Program Pelatihan : ${pelatihan?.Program}
- Tanggal Pelaksanaan : ${generateTanggalPelatihan(
    pelatihan?.TanggalMulaiPelatihan,
  )} - ${generateTanggalPelatihan(pelatihan?.TanggalBerakhirPelatihan)}
- Penyelenggara : ${pelatihan?.PenyelenggaraPelatihan}

${instruction}
🔗 https://elaut-bppsdm.kkp.go.id/admin/auth/login

#PuslatKPBeCompetent
#PuslatKPBanggaMelayaniKebutuhanKompetensi`

  return message
}
