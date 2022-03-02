const BigPromise = require("../middlewares/bigPromise")
const Product = require("../models/product")
const cloudinary = require("cloudinary")
const WhereClause = require("../utils/whereClause")

exports.addProduct = BigPromise(async (req, res, next) => {
  // add validation for required fields

  const { name, price, description, category, brand } = req.body

  if (!name || !price || !description || !category || !brand) {
    return next(
      new Error(
        "name,price,description,category,brand are required for adding a product"
      )
    )
  }

  let imageArray = []

  if (!req.files) {
    return next(new Error("images are required for adding a product"))
  }
  console.log(req.files)

  for (let index = 0; index < req.files.photos.length; index++) {
    let result = await cloudinary.v2.uploader.upload(
      req.files.photos[index].tempFilePath,
      {
        folder: "products",
      }
    )

    imageArray.push({
      id: result.public_id,
      secureUrl: result.secure_url,
    })
  }

  req.body.photos = imageArray
  req.body.user = req.user.id

  const product = await Product.create(req.body)

  res.status(200).json({
    success: true,
    product,
  })
})

exports.getProducts = BigPromise(async (req, res, next) => {
  const resultsPerPage = 5

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter()
  let products = productsObj.base
  const filteredProductsLength = products.length

  productsObj.pager(resultsPerPage)
  products = await productsObj.base

  res.status(200).json({
    success: true,
    products,
    filteredProductsLength,
  })
})

exports.getProductById = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new Error("No product found"))
  }

  res.status(200).json({
    success: true,
    product,
  })
})

exports.adminUpdateProductById = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(new Error("No product found"))
  }

  let imageArray = []

  if (req.files) {
    //delete old pics
    for (let index = 0; index < product.photos.length; index++) {
      await cloudinary.v2.uploader.destroy(product.photos[index].id)
    }
    // add new pics
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      )

      imageArray.push({
        id: result.public_id,
        secureUrl: result.secure_url,
      })
    }

    req.body.photos = imageArray
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    product,
  })
})

exports.adminDeleteProductById = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(new Error("No product found"))
  }

  for (let index = 0; index < product.photos.length; index++) {
    await cloudinary.v2.uploader.destroy(product.photos[index].id)
  }

  //IMP
  await product.remove()
  res.status(200).json({
    success: true,
    message: "product deleted",
  })
})

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body
  //IMP
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  }

  const product = await Product.findById(productId)

  if (!product) {
    return next(new Error("no product found"))
  }

  const AlreadyReviewed = product.reviews.find((review) => {
    return review.user.toString() === req.user._id.toString()
  })

  if (AlreadyReviewed) {
    //update review
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment
        review.rating = rating
      }
    })
  } else {
    // add new review
    product.reviews.push(review)
    product.numberOfReviews = product.reviews.length
  }

  // calc ratings (avg)

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length

  await product.save()

  res.status(200).json({
    sucess: true,
  })
})

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.params

  const product = await Product.findById(productId)

  if (!product) {
    return next(new Error("no product found"))
  }

  // one user can have one review only, so in deletion we just have to find out the review in the review array which is added by the logged in user and delete that

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() !== req.user._id.toString()
  )

  console.log(reviews)

  product.reviews = reviews
  product.numberOfReviews = reviews.length

  // calc ratings (avg)

  if (product.reviews.length === 0) {
    product.ratings = 0
  } else {
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length
  }

  await product.save()

  res.status(200).json({
    sucess: true,
  })
})
