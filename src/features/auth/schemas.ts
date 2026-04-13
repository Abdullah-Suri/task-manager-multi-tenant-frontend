import { z } from "zod"

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

export const verifyTwoFactorSchema = z.object({
  userId: z.number().int().positive(),
  token: z.string().length(6, "2FA token must be 6 digits."),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type VerifyTwoFactorValues = z.infer<typeof verifyTwoFactorSchema>
