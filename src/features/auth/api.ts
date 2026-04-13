"use client"

import { apiClient } from "@/lib/api/http"
import type {
  ApiResponse,
  AuthPayload,
  AuthUser,
  TwoFactorChallenge,
  TwoFactorSetupPayload,
} from "@/types/api"

type LoginInput = {
  email: string
  password: string
}

type RegisterInput = {
  name: string
  email: string
  password: string
}

type VerifyLoginTwoFactorInput = {
  userId: number
  token: string
}

type LogoutInput = {
  refreshToken: string
}

type GoogleLoginInput = {
  idToken: string
}

type UpdateProfileInput = {
  name?: string
  password?: string
}

type TwoFactorTokenInput = {
  token: string
}

export async function login(input: LoginInput) {
  const response = await apiClient.post<ApiResponse<AuthPayload | TwoFactorChallenge>>(
    "/auth/login",
    input
  )

  return response.data.data
}

export async function register(input: RegisterInput) {
  const response = await apiClient.post<ApiResponse<AuthPayload | TwoFactorChallenge>>(
    "/auth/register",
    input
  )

  return response.data.data
}

export async function verifyLoginTwoFactor(input: VerifyLoginTwoFactorInput) {
  const response = await apiClient.post<ApiResponse<AuthPayload>>(
    "/auth/2fa/verify-login",
    input
  )

  return response.data.data
}

export async function getProfile() {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/profile")
  return response.data.data
}

export async function googleLogin(input: GoogleLoginInput) {
  const response = await apiClient.post<ApiResponse<AuthPayload | TwoFactorChallenge>>(
    "/auth/google",
    input
  )

  return response.data.data
}

export async function updateProfile(input: UpdateProfileInput) {
  const response = await apiClient.patch<ApiResponse<AuthUser>>("/profile", input)
  return response.data.data
}

export async function setupTwoFactor() {
  const response = await apiClient.post<ApiResponse<TwoFactorSetupPayload>>("/auth/2fa/setup")
  return response.data.data
}

export async function confirmTwoFactor(input: TwoFactorTokenInput) {
  const response = await apiClient.post<ApiResponse<null>>("/auth/2fa/confirm", input)
  return response.data.data
}

export async function disableTwoFactor(input: TwoFactorTokenInput) {
  const response = await apiClient.delete<ApiResponse<null>>("/auth/2fa/disable", {
    data: input,
  })
  return response.data.data
}

export async function logout(input: LogoutInput) {
  const response = await apiClient.post<ApiResponse<null>>("/auth/logout", input)
  return response.data.data
}
