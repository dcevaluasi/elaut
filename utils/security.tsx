import Toast from '@/components/toast'

export const handlePasswordCriteria = (password: string) => {
  const criteria = [
    {
      regex: /.{8,}/,
      message: `Password must be at least 8 characters long.`,
    },
    {
      regex: /[A-Z]/,
      message: 'Password must contain at least one uppercase letter.',
    },
    {
      regex: /[a-z]/,
      message: 'Password must contain at least one lowercase letter.',
    },
    { regex: /[0-9]/, message: 'Password must contain at least one number.' },
    {
      regex: /[!@#$%^&*(),.?":{}|<>]/,
      message: 'Password must contain at least one special character (symbol).',
    },
  ]

  for (const { regex, message } of criteria) {
    if (!regex.test(password)) {
      Toast.fire({
        icon: 'error',
        title: 'Oopsss!',
        text: message,
      })
      return false
    }
  }

  return true
}
