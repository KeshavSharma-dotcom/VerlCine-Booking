const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            unique: true,
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR',
            uppercase: true
        },
        gateway: {
            type: String,
            enum: ['razorpay', 'cashfree', 'phonepe_pg', 'paytm_pg'],
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['upi', 'card', 'netbanking', 'wallet'],
            default: 'upi'
        },
        upiApp: {
            type: String,
            enum: ['google_pay', 'phonepe', 'paytm', 'amazon_pay', 'cred', 'other'],
            default: null
        },
        orderId: {
            type: String,
            required: true,
            index: true
        },
        transactionId: {
            type: String,
            default: null,
            index: true
        },
        paymentSignature: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
            index: true
        },
        refundId: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
)

const Payment = mongoose.model('Payment', paymentSchema)
module.exports = Payment