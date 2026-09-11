const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6
        },
        role: {
            type: String,
            enum: ["user", "admin", "theatre-admin"],
            default: "user"
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        verificationCode: {
            type: String,
            default: null
        },
        verificationCodeExpires: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
)

const User = mongoose.models.User || mongoose.model("User", userSchema)

module.exports = User