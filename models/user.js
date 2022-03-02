const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"], // it means name is required and if not given generate following error message
    maxLength: [40, "Name should be under 40 chars"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "please enter email in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minLength: [6, "password should be at least 6 char long"],
    select: false, // whenever user model is fetched password field will not come, to get it we need to explicitly call it.
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// pre save middleware for encrypting password - HOOK
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }
  this.password = await bcrypt.hash(this.password, 10)
})

// Instance methods

// NOTE: changes in this.___ will not make change in db
// for that we need to explicitly call .save({validateBeforeSave:false})

// password matching
userSchema.methods.isValidatedPassword = async function (userSentPassword) {
  return await bcrypt.compare(userSentPassword, this.password)
}

// create and return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  })
}

// generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function () {
  // just a random string
  const randomString = crypto.randomBytes(20).toString("hex")

  // make a hash of it, and store the hash in db. Send only randomString to the frontend.
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(randomString)
    .digest("hex")

  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000 // 20 mins from now

  return randomString
}

module.exports = mongoose.model("users", userSchema)
