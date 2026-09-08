const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide your full name"],
            trim: true,
            maxLength: [50, "Name cannot exceed 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Please provide your email address"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email address"
            ]
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false
        },
        role: {
            type: String,
            enum: ["user", "theatre_admin", "admin"],
            default: "user"
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otpCode: {
            type: String,
            select: false,
            default: null
        },
        otpExpiresAt: {
            type: Date,
            select: false,
            default: null
        },
        otpPurpose: {
            type: String,
            enum: ["verification", "login_2fa", "password_reset", null],
            select: false,
            default: null
        },
        isTwoFactorEnabled: {
            type: Boolean,
            default: false
        },
        profilePicURL: {
            type: String,
            default: ""
        },
        theatreAdminStatus: {
            type: String,
            enum: ["none", "pending", "approved", "rejected"],
            default: "none"
        },
        bookings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking"
            }
        ]
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.models.User || mongoose.model("User", userSchema)

module.exports = User