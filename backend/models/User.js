const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

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
            minlength: 6,
            select: false
        },
        role: {
            type: String,
            enum: ["user", "theatre-admin", "admin"],
            default: "user"
        },
        theatreAdminStatus: {
            type: String,
            enum: ["none", "pending", "approved", "rejected"],
            default: "none"
        },
        isTwoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: {
            type: String,
            default: null,
            select: false
        },
        otpCode: {
            type: String,
            default: null,
            select: false
        },
        otpExpiresAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(process.env.SALT)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema)

module.exports = User