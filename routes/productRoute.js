const express = require("express")
const {
  addProduct,
  getProducts,
  getProductById,
  adminUpdateProductById,
  adminDeleteProductById,addReview,deleteReview
} = require("../controllers/productController")
const router = express.Router()
const { isLoggedIn, customRole } = require("../middlewares/user")

//user routes
router.route("/products").get(isLoggedIn, getProducts)
router.route("/product/:id").get(isLoggedIn, getProductById)
router.route("/product/review/add").post(isLoggedIn, addReview)
router.route("/product/review/delete/:productId").delete(isLoggedIn, deleteReview)

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct)
router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateProductById)
  .delete(isLoggedIn, customRole("admin"), adminDeleteProductById)

module.exports = router
