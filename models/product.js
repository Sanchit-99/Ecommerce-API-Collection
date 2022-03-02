const mongoose = require("mongoose")

const productSchema = mongoose.Schema({

  name: {
    type: String,
    required: [true, "please provide product name"],
    trim: true,
  },

  price: {
    type: Number,
    required: [true, "please provide product price"],
    maxLength: [5, "price should not be more than 5 digits"],
  },

  description: {
    type: String,
    required: [true, "please provide product description"],
  },

  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secureUrl: {
        type: String,
        required: true,
      },
    },
  ],

  category: {
    type: String,
    required: [
      true,
      "please provide product category (shortsleeves, longsleeves, sweatshirts, hoodies)",
    ],
    //IMP
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirts", "hoodies"],
      message:
        "please provide product category (shortsleeves, longsleeves, sweatshirts, hoodies)",
    },
  },

  brand: {
    type: String,
    required: [true, "please provide product brand"],
  },

  ratings: {
    type: Number,
    default: 0,
  },

  numberOfReviews: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "users",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],

  user: {
      //IMP
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

})

module.exports = mongoose.model("products", productSchema)
