const { Schema } = require('mongoose');

const HoldingsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    qty: Number,
    avg: Number,
    price: Number,
    net: String,
    day: String,
    stopLoss: { type: Number, default: null },
    target: { type: Number, default: null },
});

HoldingsSchema.index({ user: 1 });
HoldingsSchema.index({ user: 1, name: 1 });
HoldingsSchema.index({ stopLoss: 1 });
HoldingsSchema.index({ target: 1 });

module.exports = { HoldingsSchema };