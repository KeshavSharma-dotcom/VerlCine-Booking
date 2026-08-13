export type UserRole = "user" | "theatre-admin" | "admin"
export type TheatreAdminStatus = "none" | "pending" | "approved" | "rejected"
export type ThemePreference = "light" | "dark" | "system"

export interface IUser {
    id: string
    name: string
    email: string
    role: UserRole
    theatreAdminStatus?: TheatreAdminStatus
    preferences?: {
        theme: ThemePreference
    }
    isTwoFactorEnabled: boolean
}

export interface IMovie {
    id: string
    title: string
    genre: string[]
    durationMinutes: number
    posterUrl: string
    description: string
}

export interface ISeat {
    seatNumber: string
    status: "available" | "locked" | "booked"
    lockedBy?: string | null
}

export interface ITicket {
    bookingId: string
    movieTitle: string
    seatNumber: string
    qrCodeData: string
    showtime: string
    totalAmount: number
}

export interface AuthResponse {
    success: boolean
    message?: string
    is2FARequired?: boolean
    user?: IUser
}