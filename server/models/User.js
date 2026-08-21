const mongoose = require("mongoose")
const config = require("../config/config")
const bcrypt = require("bcryptjs")
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        match: [config.auth.emailRegex, "Invalid Email!"]
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    otp : {
        type : Number
    },
    isVerified : {
        type : Boolean
    }
}) 

userSchema.pre('save',async function(){
    if('password'.isModified()){
        return
    }
    const salt = await bcrypt.genSalt(Number(config.auth.salt))
    const pass = await bcrypt.hash(salt,pass)
})