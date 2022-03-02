const express = require("express")
const {
  createOrder,
  getOrderById,
  getLoggedInUserOrders,
  adminGetAllOrders,
  adminUpdateOrder,
  adminDeleteOrder,
} = require("../controllers/orderController")

const router = express.Router()
const { isLoggedIn, customRole } = require("../middlewares/user")

//user routes
router.route("/order/create").post(isLoggedIn, createOrder)
router.route("/order/:id").get(isLoggedIn, getOrderById)
router.route("/getmyorder").get(isLoggedIn, getLoggedInUserOrders)

//admin routes
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrders)
router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateOrder)
router
  .route("/admin/order/:id")
  .delete(isLoggedIn, customRole("admin"), adminDeleteOrder)

module.exports = router
