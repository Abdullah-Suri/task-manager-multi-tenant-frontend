"use client"

import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosInstance,
} from "axios"

import { env } from "@/lib/config/env"
import { clearSession, getAccessToken, getRefreshToken } from "@/lib/api/auth-storage"
import { useAuthStore } from "@/stores/auth-store"
import type { ApiResponse, AuthPayload } from "@/types/api"

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
})

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
})

let refreshPromise: Promise<string | null> | null = null
let interceptorsInitialized = false

function attachBearerToken(config: InternalAxiosRequestConfig) {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`)
  } else {
    config.headers.delete("Authorization")
  }

  return config
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      return null
    }

    const response = await refreshClient.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh",
      { refreshToken }
    )

    const payload = response.data.data
    const currentState = useAuthStore.getState()

    if (currentState.user && currentState.refreshToken) {
      currentState.setSession({
        user: currentState.user,
        refreshToken: currentState.refreshToken,
        accessToken: payload.accessToken,
      })
    }

    return payload.accessToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

function isRefreshRequest(instance: AxiosInstance, config?: InternalAxiosRequestConfig) {
  return instance === refreshClient || config?.url?.includes("/auth/refresh")
}

async function retryUnauthorizedRequest(error: AxiosError) {
  const originalRequest = error.config

  if (!originalRequest || originalRequest._retry || error.response?.status !== 401) {
    throw error
  }

  if (isRefreshRequest(apiClient, originalRequest)) {
    clearSession()
    throw error
  }

  originalRequest._retry = true

  try {
    const nextAccessToken = await refreshAccessToken()

    if (!nextAccessToken) {
      clearSession()
      throw error
    }

    originalRequest.headers.set("Authorization", `Bearer ${nextAccessToken}`)
    return apiClient(originalRequest)
  } catch (refreshError) {
    clearSession()
    throw refreshError
  }
}

export function setupApiInterceptors() {
  if (interceptorsInitialized) {
    return () => undefined
  }

  interceptorsInitialized = true
  const requestId = apiClient.interceptors.request.use(attachBearerToken)
  const responseId = apiClient.interceptors.response.use(
    (response) => response,
    retryUnauthorizedRequest
  )

  return () => {
    interceptorsInitialized = false
    apiClient.interceptors.request.eject(requestId)
    apiClient.interceptors.response.eject(responseId)
  }
}

setupApiInterceptors()
