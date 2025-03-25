export const generateTimestamp = (): string => {
  return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

export const formatDateRange = (start: string, end: string): string => {
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr
      .split(' ')
      .map((part, index) =>
        index === 1 ? getMonthNumber(part) : parseInt(part, 10),
      )
    return new Date(year as number, (month as number) - 1, day as number)
  }

  const getMonthNumber = (month: string): number => {
    const months: { [key: string]: number } = {
      Januari: 1,
      Februari: 2,
      Maret: 3,
      April: 4,
      Mei: 5,
      Juni: 6,
      Juli: 7,
      Agustus: 8,
      September: 9,
      Oktober: 10,
      November: 11,
      Desember: 12,
    }
    return months[month] || 0
  }

  const getMonthName = (month: number): string => {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]
    return months[month]
  }

  const startDate = parseDate(start)
  const endDate = parseDate(end)

  const formattedStart = startDate.getDate()
  const formattedEnd = endDate.getDate()
  const formattedMonth = getMonthName(endDate.getMonth())
  const formattedYear = endDate.getFullYear()

  return `${formattedStart} - ${formattedEnd} ${formattedMonth} ${formattedYear}`
}

export const formatDateRangeEnglish = (start: string, end: string): string => {
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr
      .split(' ')
      .map((part, index) =>
        index === 1 ? getMonthNumber(part) : parseInt(part, 10),
      )
    return new Date(year as number, (month as number) - 1, day as number)
  }

  const getMonthNumber = (month: string): number => {
    const months: { [key: string]: number } = {
      Januari: 1,
      Februari: 2,
      Maret: 3,
      April: 4,
      Mei: 5,
      Juni: 6,
      Juli: 7,
      Agustus: 8,
      September: 9,
      Oktober: 10,
      November: 11,
      Desember: 12,
    }
    return months[month] || 0
  }

  const getMonthName = (month: number): string => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return months[month]
  }

  const startDate = parseDate(start)
  const endDate = parseDate(end)

  const formattedStart = startDate.getDate()
  const formattedEnd = endDate.getDate()
  const formattedMonth = getMonthName(endDate.getMonth())
  const formattedYear = endDate.getFullYear()

  return `${formattedMonth} ${formattedStart} - ${formattedEnd} ${formattedYear}`
}

export const getTodayInIndonesianFormat = (): string => {
  const months: string[] = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  const today = new Date()
  const day = today.getDate()
  const month = months[today.getMonth()]
  const year = today.getFullYear()

  return `${day} ${month} ${year}`
}

export const getDateInIndonesianFormat = (dateString: string): string => {
  const months: string[] = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  const date = new Date(dateString)
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}
