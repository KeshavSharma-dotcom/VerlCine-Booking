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
        profilePicURL: {
            type: String,
            default: function () {
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name || "User")}&background=random`
            }
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
        isVerified: {
            type: Boolean,
            default: false
        },
        isTwoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorMethod: {
            type: String,
            enum: ["email", "phone", null],
            default: null
        },
        twoFactorTarget: {
            type: String,
            default: null
        },
        tempTwoFactorTarget: {
            type: String,
            default: null,
            select: false
        },
        tempTwoFactorMethod: {
            type: String,
            enum: ["email", "phone", null],
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
            default: null,
            select: false
        },
        otpPurpose: {
            type: String,
            enum: ["account-verification", "2fa-setup-or-update", "2fa-login", null],
            default: null,
            select: false
        }
    },
    { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    const saltRounds = parseInt(process.env.SALT, 10) || 10
    const salt = await bcrypt.genSalt(saltRounds)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema)
module.exports = User