const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  about: String,
});

module.exports = mongoose.model("Contact", contactSchema);
