import { io, Socket } from "socket.io-client"

const SOCKET_URL = import.meta.env.API_BASE_URL?.replace("/api", "") || "http://localhost:3000"

export const socket: Socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true
})