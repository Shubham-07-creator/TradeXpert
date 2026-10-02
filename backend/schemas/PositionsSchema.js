const { Schema } = require("mongoose");

const PositionsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  product: String,
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
  isLoss: Boolean,
  stopLoss: { type: Number, default: null },
  target: { type: Number, default: null },
});

PositionsSchema.index({ user: 1 });
PositionsSchema.index({ user: 1, name: 1 });

module.exports = { PositionsSchema };