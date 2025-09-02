export const generateTimestamp = (): string => {
  return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

export const formatDateRange = (start: string, end: string): string => {
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

  // universal date parser
  const parseDate = (dateStr: string): Date => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // ISO format: 2025-07-29
      return new Date(dateStr)
    } else if (/^\d{4}-\d{2}$/.test(dateStr)) {
      // Year-Month only: 2025-08 → default to first day
      return new Date(`${dateStr}-01`)
    } else {
      // Indonesian format: 29 Juli 2025
      const [day, monthName, year] = dateStr.split(' ')
      return new Date(Number(year), getMonthNumber(monthName) - 1, Number(day))
    }
  }

  const startDate = parseDate(start)
  const endDate = parseDate(end)

  const formattedStart = startDate.getDate()
  const formattedEnd = endDate.getDate()
  const startMonth = getMonthName(startDate.getMonth())
  const endMonth = getMonthName(endDate.getMonth())
  const year = endDate.getFullYear()

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${formattedStart} - ${formattedEnd} ${endMonth} ${year}`
  } else {
    return `${formattedStart} ${startMonth} - ${formattedEnd} ${endMonth} ${year}`
  }
}

export const formatDateRangeEnglish = (start: string, end: string): string => {
  // helper: Indonesian month → number
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

  // helper: number → English month
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

  // helper: day → ordinal
  const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return `${day}th`
    const lastDigit = day % 10
    switch (lastDigit) {
      case 1:
        return `${day}st`
      case 2:
        return `${day}nd`
      case 3:
        return `${day}rd`
      default:
        return `${day}th`
    }
  }

  // universal date parser
  const parseDate = (dateStr: string): Date => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // ISO format: 2025-07-29
      return new Date(dateStr)
    } else if (/^\d{4}-\d{2}$/.test(dateStr)) {
      // Year-Month only: 2025-08 → default to first day
      return new Date(`${dateStr}-01`)
    } else {
      // Indonesian format: 29 Juli 2025
      const [day, monthName, year] = dateStr.split(' ')
      return new Date(Number(year), getMonthNumber(monthName) - 1, Number(day))
    }
  }

  const startDate = parseDate(start)
  const endDate = parseDate(end)

  const formattedStart = getOrdinalSuffix(startDate.getDate())
  const formattedEnd = getOrdinalSuffix(endDate.getDate())
  const startMonth = getMonthName(startDate.getMonth())
  const endMonth = getMonthName(endDate.getMonth())
  const year = endDate.getFullYear()

  // if same month
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${endMonth} ${formattedStart} - ${formattedEnd} ${year}`
  } else {
    return `${startMonth} ${formattedStart} - ${endMonth} ${formattedEnd} ${year}`
  }
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

export const parseIndonesianDate = (dateStr: string): Date | null => {
  const months: Record<string, number> = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11,
  }

  const parts = dateStr.toLowerCase().split(' ')
  if (parts.length !== 3) return null

  const [dayStr, monthStr, yearStr] = parts
  const day = parseInt(dayStr)
  const month = months[monthStr]
  const year = parseInt(yearStr)

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null

  return new Date(year, month, day)
}

export const getCurrentYear = new Date().getFullYear().toString()

export const getCurrentQuarter = () => {
  const month = new Date().getMonth() + 1
  if (month >= 1 && month <= 3) return 'TW I'
  if (month >= 4 && month <= 6) return 'TW II'
  if (month >= 7 && month <= 9) return 'TW III'
  if (month >= 10 && month <= 12) return 'TW IV'
  return 'Unknown'
}

export const getQuarterForFiltering = (dateString: string) => {
  const month = new Date(dateString).getMonth() + 1
  if (month >= 1 && month <= 3) return 'TW I'
  if (month >= 1 && month <= 6) return 'TW II'
  if (month >= 1 && month <= 9) return 'TW III'
  if (month >= 1 && month <= 12) return 'TW IV'
  return 'Unknown'
}

export function formatTanggalIndo(dateString: string): string {
  const bulanIndo = [
    'JANUARI',
    'FEBRUARI',
    'MARET',
    'APRIL',
    'MEI',
    'JUNI',
    'JULI',
    'AGUSTUS',
    'SEPTEMBER',
    'OKTOBER',
    'NOVEMBER',
    'DESEMBER',
  ]

  const [year, month, day] = dateString.split('-')

  const bulan = bulanIndo[parseInt(month, 10) - 1]
  return `${day} ${bulan} ${year}`
}

export function isToday(dateString: string): boolean {
  const inputDate = new Date(dateString)
  const today = new Date()

  return (
    inputDate.getFullYear() === today.getFullYear() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getDate() === today.getDate()
  )
}
