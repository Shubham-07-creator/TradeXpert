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

module.exports = { HoldingsSchema };