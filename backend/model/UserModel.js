const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  dob: String,
  city: String,
  state: String,
  address: String,
});

const UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };