const express = require("express")
const router = express.Router()
const { isLoggedIn, customRole } = require("../middlewares/user")

const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  userdashboard,
  changePassword,
  updateUserDetails,
  adminAllUsers,
  managerAllUsers,
  adminGetUserById,
  adminUpdateUserById,
  adminDeleteUserById,
} = require("../controllers/userController")

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/forgotPassword").post(forgotPassword)
router.route("/password/reset/:token").post(passwordReset)
router.route("/userdashboard").get(isLoggedIn, userdashboard)
router.route("/password/update").post(isLoggedIn, changePassword)
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails)

//admin only routes
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUsers)
router
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), adminGetUserById)
  .put(isLoggedIn, customRole("admin"), adminUpdateUserById)
  .delete(isLoggedIn, customRole("admin"), adminDeleteUserById)

  //manager only routes
router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), managerAllUsers)

module.exports = router
