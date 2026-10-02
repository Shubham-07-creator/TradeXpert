const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  name: String,
  qty: Number,
  price: Number,
  mode: { type: String, enum: ["BUY", "SELL"] },
  orderType: {
    type: String,
    enum: ["MARKET", "LIMIT", "SL_TRIGGER", "TARGET_TRIGGER"],
    default: "MARKET",
  },
  status: {
    type: String,
    enum: ["EXECUTED", "OPEN", "CANCELLED"],
    default: "EXECUTED",
  },
  limitPrice: { type: Number, default: 0 },
  product: { type: String, enum: ["CNC", "MIS"], default: "CNC" },
  stopLoss: { type: Number, default: null },
  target: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = { OrdersSchema };