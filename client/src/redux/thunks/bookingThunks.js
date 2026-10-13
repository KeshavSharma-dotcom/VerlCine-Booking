import { createAsyncThunk } from "@reduxjs/toolkit"

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true)
            return
        }
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

export const processBookingPayment = createAsyncThunk(
    "booking/processPayment",
    async ({ showtimeId, seatsBooked, userProfile }, { rejectWithValue }) => {
        try {
            const isScriptLoaded = await loadRazorpayScript()
            if (!isScriptLoaded) {
                return rejectWithValue("Razorpay SDK failed to load. Check your network.")
            }

            const orderRes = await fetch("/api/v1/bookings/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ showtimeId, seatsBooked })
            })

            const orderData = await orderRes.json()
            if (!orderRes.ok) {
                return rejectWithValue(orderData.message || "Failed to create booking order")
            }

            return new Promise((resolve, reject) => {
                const options = {
                    key: orderData.key,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "CineVerl Cinemas",
                    description: `Booking for ${seatsBooked.length} seat(s)`,
                    order_id: orderData.orderId,
                    prefill: {
                        name: userProfile?.name || "",
                        email: userProfile?.email || "",
                        contact: userProfile?.phone || ""
                    },
                    theme: {
                        color: "#e50914"
                    },
                    handler: async (response) => {
                        try {
                            const verifyRes = await fetch("/api/v1/bookings/verify", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                    bookingId: orderData.bookingId,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    paymentMethod: "card"
                                })
                            })

                            const verifyData = await verifyRes.json()
                            if (!verifyRes.ok) {
                                return reject(new Error(verifyData.message || "Payment verification failed"))
                            }

                            resolve(verifyData.booking)
                        } catch (err) {
                            reject(err)
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error("Payment cancelled by user"))
                        }
                    }
                }

                const rzp = new window.Razorpay(options)
                rzp.open()
            })
        } catch (err) {
            return rejectWithValue(err.message || "Checkout session failed")
        }
    }
)

export const fetchBookingDetails = createAsyncThunk(
    "booking/fetchDetails",
    async (bookingId, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/v1/bookings/${bookingId}`, {
                method: "GET",
                credentials: "include"
            })
            const data = await res.json()
            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to fetch ticket")
            }
            return data.booking
        } catch (err) {
            return rejectWithValue(err.message || "Network error loading booking")
        }
    }
)