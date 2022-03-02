const User = require("../models/user")
const BigPromise = require("../middlewares/bigPromise")
const cookieToken = require("../utils/cookieToken")
const fileUpload = require("express-fileupload")
const cloudinary = require("cloudinary")
const mailHelper = require("../utils/emailHelper")
const crypto = require("crypto")

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password } = req.body

  if (!email || !name || !password) {
    return next(new Error("Please provide email, name and password"))
  }

  let result
  if (req.files) {
    //images are sent
    let file = req.files.photo
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    })
  }

  //IMP
  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secureUrl: result.secure_url,
    },
  })

  cookieToken(user, res)
})

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new Error("please provide email and password"))
  }

  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return next(new Error("Email/password incorrect"))
  }

  const isPasswordCorrect = await user.isValidatedPassword(password)

  if (!isPasswordCorrect) {
    return next(new Error("Email/password incorrect"))
  }

  cookieToken(user, res)
})

exports.logout = BigPromise(async (req, res, next) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "Logout success",
    })
})

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    return next(new Error("Email not found"))
  }

  const forgotToken = user.getForgotPasswordToken()

  await user.save({ validateBeforeSave: false })

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`

  const message = `Copy paste this link into URL to reset password \n\n ${myUrl}`

  try {
    const option = {
      message,
      subject: "Reset Password - ecomm",
      toEmail: email,
    }
    await mailHelper(option)
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    })
  } catch (error) {
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    await user.save({ validateBeforeSave: false })
    return next(new Error("email sending error" + error.message))
  }
})

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token
  const encryptedToken = crypto.createHash("sha256").update(token).digest("hex")

  const user = await User.findOne({
    encryptedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  })
  if (!user) {
    return next(new Error("Token invalid/expired"))
  }

  const { password, confirmPassword } = req.body

  if (!password || !confirmPassword) {
    return next(new Error("please send password and confirm password"))
  }

  if (password !== confirmPassword) {
    return next(new Error("password and confirm password do not match"))
  }

  user.password = password
  user.forgotPasswordToken = undefined
  user.forgotPasswordExpiry = undefined

  await user.save()

  cookieToken(user, res)
})

exports.userdashboard = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user._id)

  res.status(200).json({
    success: true,
    user,
  })
})

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user._id

  const user = await User.findById(userId).select("+password")

  const { oldPassword, newPassword } = req.body

  const oldPassMatch = await user.isValidatedPassword(oldPassword)

  if (!oldPassMatch) {
    return next(new Error("old password does not match"))
  }

  user.password = newPassword
  await user.save()
  cookieToken(user, res)
})

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const { name, email } = req.body

  if (!name || !email) {
    return next(new Error("please send name and email"))
  }

  const newData = { name, email }

  if (req.files) {
    const user = await User.findById(req.user._id)
    const imageId = user.photo.id
    const resp = await cloudinary.v2.uploader.destroy(imageId)
    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    )
    newData.photo = {
      id: result.public_id,
      secureUrl: result.secure_url,
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, newData, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    user,
  })
})

exports.managerAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" })
  res.status(200).json({ users })
})

exports.adminAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find()
  res.status(200).json({ users })
})

exports.adminGetUserById = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new Error("user not found"))
  }

  res.status(200).json({
    success: true,
    user,
  })
})

exports.adminUpdateUserById = BigPromise(async (req, res, next) => {
  const { name, email, role } = req.body

  if (!name || !email || !role) {
    return next(new Error("please send name, role and email"))
  }

  const newData = { name, email, role }

  if (req.files) {
    const user = await User.findById(req.params.id)
    const imageId = user.photo.id
    const resp = await cloudinary.v2.uploader.destroy(imageId)
    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    )
    newData.photo = {
      id: result.public_id,
      secureUrl: result.secure_url,
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    user,
  })
})

exports.adminDeleteUserById = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new Error("user not found"))
  }

  const imageId = user.photo.id
  await cloudinary.v2.uploader.destroy(imageId)
  await user.remove()

  res.status(200).json({
    success: true,
  })
})
