const BigPromise = require("../middlewares/bigPromise")
const jwt = require("jsonwebtoken")
const User = require("../models/user")

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "")

  if (!token) {
    return next(new Error("Login to access this route"))
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
  req.user = await User.findById(decodedToken.id)
  next()
})

exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new Error("You are not allowed for this resource"))
    }
    next()
  }
}
