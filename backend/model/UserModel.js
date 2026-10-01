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
  role: { type: String, default: "user" }, // "user" or "admin"
  wallet: { type: Number, default: 100000 }, // starting virtual balance ₹1,00,000
  realizedPnL: { type: Number, default: 0 }, // all-time locked-in profit/loss from completed sells
});

const UserModel = mongoose.model("User", userSchema);

module.exports = { UserModel };