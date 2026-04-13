const DEFAULT_API_ORIGIN = "http://localhost:5000"
const DEFAULT_API_BASE_URL = `${DEFAULT_API_ORIGIN}/api`

export const env = {
  appName: "TaskHub",
  apiOrigin: process.env.NEXT_PUBLIC_API_ORIGIN ?? DEFAULT_API_ORIGIN,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL,
  socketUrl:
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    process.env.NEXT_PUBLIC_API_ORIGIN ??
    DEFAULT_API_ORIGIN,
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
}
