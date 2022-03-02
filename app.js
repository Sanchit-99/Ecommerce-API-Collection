const express = require("express")
const morgan = require("morgan")
const fileUpload = require("express-fileupload")
const cookieParser = require("cookie-parser")
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
)

// morgan middleware
app.use(morgan("tiny"))

// import all routes here
const homeRoute = require("./routes/homeRoute")
const userRoute = require("./routes/userRoute")
const productRoute = require("./routes/productRoute")
const orderRoute = require("./routes/orderRoute")
// router middleware
app.use("/api/v1", homeRoute)
app.use("/api/v1", userRoute)
app.use("/api/v1", productRoute)
app.use("/api/v1", orderRoute)

module.exports = app
