export function getPenyeleggara(city: string): string {
  switch (city.toLowerCase()) {
    case 'tegal':
      return 'BPPP Tegal'
    case 'medan':
      return 'BPPP Medan'
    case 'ambon':
      return 'BPPP Ambon'
    case 'banyuwangi':
      return 'BPPP Banyuwangi'
    case 'bitung':
      return 'BPPP Bitung'
    default:
      return 'Penyeleggara not found'
  }
}

export function extractPathAfterBppp(path: string): string {
  const prefix = '/bppp/'
  const index = path.indexOf(prefix)

  if (index !== -1) {
    // Extract the part after "/bppp/"
    return path.substring(index + prefix.length)
  }

  // Return an empty string or handle the case when "/bppp/" is not found
  return ''
}

export function convertIdSarpras(arr: number[]): string {
  return arr.join(',')
}

export function addFiveYears(dateString: string) {
  // Peta nama bulan dalam bahasa Indonesia ke angka bulan (0-11)
  if (dateString === '') {
    return '-'
  } else {
    const monthMap: { [key: string]: number } = {
      Januari: 0,
      Februari: 1,
      Maret: 2,
      April: 3,
      Mei: 4,
      Juni: 5,
      Juli: 6,
      Agustus: 7,
      September: 8,
      Oktober: 9,
      November: 10,
      Desember: 11,
    }

    // Pisahkan string input
    const [day, monthName, year] = dateString!.split(' ')

    // Konversi ke Date
    const month = monthMap[monthName]
    if (month === undefined) throw new Error('Format bulan tidak valid!')

    const date = new Date(Number(year), month, Number(day))

    // Tambahkan 5 tahun
    date.setFullYear(date.getFullYear() + 5)

    // Format kembali ke bahasa Indonesia
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }
}

export function getNumberFromURLDetailPelatihanAdmin(
  url: string,
): number | null {
  const parts = url.split('/')

  // Assuming the number is always at the 5th segment of the URL
  const numberPart = parts[7] // Index 5 corresponds to the 6th element in the array

  // Convert the extracted part to a number
  const number = parseInt(numberPart, 10)

  // Check if the extracted part is a valid number
  if (!isNaN(number)) {
    return number
  } else {
    return null // Return null if the extracted part is not a number
  }
}

export function hitungHariPelatihan(
  tanggalMulai: string,
  tanggalBerakhir: string,
) {
  const mulai: any = new Date(tanggalMulai)
  const berakhir: any = new Date(tanggalBerakhir)

  // Menghitung selisih waktu dalam milidetik
  const selisihWaktu = berakhir - mulai

  // Mengonversi milidetik ke hari
  const jumlahHari = selisihWaktu / (1000 * 60 * 60 * 24) + 1

  return jumlahHari
}
