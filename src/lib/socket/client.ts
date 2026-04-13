"use client"

import { io } from "socket.io-client"

import { env } from "@/lib/config/env"
import { getAccessToken } from "@/lib/api/auth-storage"

let socket: ReturnType<typeof io> | null = null

export function getSocket() {
  if (socket) {
    return socket
  }

  socket = io(env.socketUrl, {
    autoConnect: false,
    auth: {
      token: getAccessToken(),
    },
  })

  return socket
}
