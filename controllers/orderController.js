const Order = require("../models/order")
const Product = require("../models/product")
const BigPromise = require("../middlewares/bigPromise")

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  })

  res.status(200).json({
    success: true,
    order,
  })
})

exports.getOrderById = BigPromise(async (req, res, next) => {
  //IMP
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  )

  if (!order) {
    return next(new Error("order not found"))
  }
  res.status(200).json({
    success: true,
    order,
  })
})

exports.getLoggedInUserOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })

  if (!orders) {
    return next(new Error("order not found"))
  }
  res.status(200).json({
    success: true,
    orders,
  })
})

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find()

  if (!orders) {
    return next(new Error("order not found"))
  }
  res.status(200).json({
    success: true,
    orders,
  })
})

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new Error("order not found"))
  }

  if (order.orderStatus === "delivered") {
    return next(new Error("order is already delivered cant update further"))
  }

  const { orderStatus } = req.body

  if (!orderStatus) {
    return next(new Error("please provide order status to update"))
  }
  order.orderStatus = orderStatus
  if (orderStatus === "delivered") {
    // update stock
  }
  await order.save()
  res.status(200).json({
    success: true,
    order,
  })
})

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new Error("order not found"))
  }
  await order.remove()
  res.status(200).json({
    success: true,
    message: "order deleted",
  })
})
