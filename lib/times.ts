export const isDatePassedOrToday = (dateStr: string): boolean => {
  const inputDate = new Date(dateStr)
  const today = new Date()

  // Reset time for accurate comparison
  inputDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  return inputDate <= today
}
