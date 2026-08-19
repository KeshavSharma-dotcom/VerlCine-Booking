import { fetchClient } from './apiClient'

export interface Seat {
    seatNumber: string
    status: 'available' | 'locked' | 'booked'
    lockedBy?: string | null
    lockedUntil?: string | null
}

export interface Showtime {
    _id: string
    movie: string
    theatre: {
        _id: string
        name: string
        city: string
        address: string
    }
    screenNumber: number
    startTime: string
    ticketPrice: number
    seats: Seat[]
}

export interface Booking {
    _id: string
    user: string
    showtime: Showtime
    seatsBooked: string[]
    totalAmount: number
    status: 'pending' | 'confirmed' | 'cancelled'
    qrCodeData: string
    createdAt: string
    payment?: {
        orderId: string
        transactionId: string
        gateway: string
        paymentMethod: string
        upiApp?: string
        status: string
        createdAt: string
    }
}

export const getShowtimeById = (id: string): Promise<{ success: boolean; showtime: Showtime }> => {
    return fetchClient<{ success: boolean; showtime: Showtime }>(`/showtimes/${id}`, {
        method: 'GET'
    })
}

export const createBooking = (payload: { showtimeId: string; seats: string[]; totalAmount: number }): Promise<{ success: boolean; booking: Booking }> => {
    return fetchClient<{ success: boolean; booking: Booking }>('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
}

export const getUserBookingHistory = (): Promise<{ success: boolean; bookings: Booking[] }> => {
    return fetchClient<{ success: boolean; bookings: Booking[] }>('/bookings/history', {
        method: 'GET'
    })
}