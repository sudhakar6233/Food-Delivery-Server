const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    name: String,
    street: String,
    city: String,
    pincode: String,
    phone: String,
    product: String,
    description: String,
    price: String,
    paymentStatus: {
      type: String,
      default: "Success",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
