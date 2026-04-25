require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel");

const app = express();

const PORT = process.env.PORT || 3002;

const uri = process.env.MONGO_URL;

const FRONTEND = process.env.FRONTEND_URL || "*";

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(express.json());

// ==========================================
// DB CONNECT
// ==========================================

mongoose
  .connect(uri)
  .then(() => console.log("DB Connected ✅"))
  .catch((err) => console.log("DB ERROR ❌", err));

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send("TradeXpert API Running 🚀");
});

// ==========================================
// SIGNUP
// ==========================================

app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, dob, city, state, address, password } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Required fields missing ❌",
      });
    }

    const existing = await UserModel.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "User already exists ❌",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      phone,
      dob,
      city,
      state,
      address,
      password: hashed,
    });

    res.json({
      message: "Signup success ✅",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Signup failed ❌",
    });
  }
});

// ==========================================
// LOGIN
// ==========================================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found ❌",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password ❌",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET || "secret123",
    );

    res.json({
      message: "Login success ✅",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Login failed ❌",
    });
  }
});

// ==========================================
// PROFILE
// ==========================================

app.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "No token ❌",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    const user = await UserModel.findById(decoded.id);

    res.json(user);
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized ❌",
    });
  }
});

// ==========================================
// UPDATE PROFILE
// ==========================================

app.put("/updateProfile", async (req, res) => {
  try {
    const { id, phone, dob, city, state, address } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        phone,
        dob,
        city,
        state,
        address,
      },
      {
        new: true,
      },
    );

    res.json({
      message: "Profile updated ✅",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Update failed ❌",
    });
  }
});

// ==========================================
// GET DATA
// ==========================================

app.get("/allHoldings", async (req, res) => {
  const data = await HoldingsModel.find({});
  res.json(data);
});

app.get("/allPositions", async (req, res) => {
  const data = await PositionsModel.find({});
  res.json(data);
});

app.get("/orders", async (req, res) => {
  const data = await OrdersModel.find({}).sort({
    createdAt: -1,
  });

  res.json(data);
});

// ==========================================
// ORDER SYSTEM
// ==========================================

app.post("/newOrder", async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;

    const quantity = Number(qty);

    let holdings = await HoldingsModel.find({ name });

    let positions = await PositionsModel.find({ name });

    // BUY
    if (mode === "BUY") {
      await HoldingsModel.create({
        name,
        qty: quantity,
        avg: price,
        price,
        net: "+0.00%",
        day: "+0.00%",
      });

      await PositionsModel.create({
        product: "CNC",
        name,
        qty: quantity,
        avg: price,
        price,
        chg: "+0.00%",
      });

      await OrdersModel.create({
        name,
        qty: quantity,
        price,
        mode,
      });

      return res.send("Buy success");
    }

    // SELL
    if (mode === "SELL") {
      if (!holdings.length) {
        return res.status(400).json({
          message: "Stock not bought yet ❌",
        });
      }

      let totalQty = holdings.reduce((sum, h) => sum + h.qty, 0);

      if (quantity > totalQty) {
        return res.status(400).json({
          message: "Not enough quantity ❌",
        });
      }

      let remaining = quantity;

      for (let h of holdings) {
        if (remaining <= 0) break;

        if (h.qty <= remaining) {
          remaining -= h.qty;

          await HoldingsModel.deleteOne({
            _id: h._id,
          });
        } else {
          h.qty -= remaining;

          remaining = 0;

          await h.save();
        }
      }

      let remainingPos = quantity;

      for (let p of positions) {
        if (remainingPos <= 0) break;

        if (p.qty <= remainingPos) {
          remainingPos -= p.qty;

          await PositionsModel.deleteOne({
            _id: p._id,
          });
        } else {
          p.qty -= remainingPos;

          remainingPos = 0;

          await p.save();
        }
      }

      await OrdersModel.create({
        name,
        qty: quantity,
        price,
        mode,
      });

      return res.send("Sell success");
    }

    res.status(400).send("Invalid order");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// ==========================================
// SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});
