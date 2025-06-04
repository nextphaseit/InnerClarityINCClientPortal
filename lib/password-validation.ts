export interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
  met: boolean
}

export const passwordRequirements = (password: string): PasswordRequirement[] => [
  {
    label: "At least 8 characters",
    test: (pwd) => pwd.length >= 8,
    met: password.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (pwd) => /[A-Z]/.test(pwd),
    met: /[A-Z]/.test(password),
  },
  {
    label: "One lowercase letter",
    test: (pwd) => /[a-z]/.test(pwd),
    met: /[a-z]/.test(password),
  },
  {
    label: "One number",
    test: (pwd) => /\d/.test(pwd),
    met: /\d/.test(password),
  },
  {
    label: "One special character",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
]

export const isPasswordValid = (password: string): boolean => {
  return passwordRequirements(password).every((req) => req.met)
}
