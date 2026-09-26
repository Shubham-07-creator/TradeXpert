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
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

const PORT = process.env.PORT || 3002;

const uri = process.env.MONGO_URL;

const FRONTEND = process.env.FRONTEND_URL || "*";

// ==========================================
// MIDDLEWARE
// ==========================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
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
      wallet: 100000, // every new user starts with a virtual ₹1,00,000
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
      { expiresIn: "7d" },
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
// PROFILE (protected)
// ==========================================

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    res.json(user);
  } catch (err) {
    res.status(401).json({
      message: "Unauthorized ❌",
    });
  }
});

// ==========================================
// UPDATE PROFILE (protected)
// ==========================================

app.put("/updateProfile", authMiddleware, async (req, res) => {
  try {
    const { phone, dob, city, state, address } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.userId,
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
    ).select("-password");

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
// WALLET (protected) — add / withdraw virtual funds
// ==========================================

app.post("/wallet/add", authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Enter a valid amount ❌" });
    }

    const user = await UserModel.findByIdAndUpdate(
      req.userId,
      { $inc: { wallet: amount } },
      { new: true },
    ).select("-password");

    res.json({ message: "Funds added ✅", user });
  } catch (err) {
    res.status(500).json({ message: "Add funds failed ❌" });
  }
});

app.post("/wallet/withdraw", authMiddleware, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const user = await UserModel.findById(req.userId);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Enter a valid amount ❌" });
    }

    if (amount > user.wallet) {
      return res.status(400).json({ message: "Insufficient balance ❌" });
    }

    user.wallet -= amount;
    await user.save();

    res.json({ message: "Withdrawal successful ✅", user });
  } catch (err) {
    res.status(500).json({ message: "Withdraw failed ❌" });
  }
});

// ==========================================
// GET DATA (protected, scoped to logged-in user)
// ==========================================

app.get("/allHoldings", authMiddleware, async (req, res) => {
  const data = await HoldingsModel.find({ user: req.userId });
  res.json(data);
});

app.get("/allPositions", authMiddleware, async (req, res) => {
  const data = await PositionsModel.find({ user: req.userId });
  res.json(data);
});

app.get("/orders", authMiddleware, async (req, res) => {
  const data = await OrdersModel.find({ user: req.userId }).sort({
    createdAt: -1,
  });

  res.json(data);
});

// ==========================================
// ORDER SYSTEM (protected, wallet-checked, per-user)
// ==========================================

app.post("/newOrder", authMiddleware, async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;

    const quantity = Number(qty);
    const orderPrice = Number(price);

    if (!name || !quantity || quantity <= 0 || !orderPrice || orderPrice <= 0) {
      return res.status(400).json({ message: "Invalid order details ❌" });
    }

    const user = await UserModel.findById(req.userId);

    let holdings = await HoldingsModel.find({ user: req.userId, name });
    let positions = await PositionsModel.find({ user: req.userId, name });

    // ==================== BUY ====================
    if (mode === "BUY") {
      const cost = quantity * orderPrice;

      if (cost > user.wallet) {
        return res.status(400).json({
          message: "Insufficient funds ❌",
        });
      }

      // If this stock is already held, merge into it with a new average
      // price instead of creating a duplicate row every time.
      let holding = holdings[0];

      if (holding) {
        const totalQty = holding.qty + quantity;
        const newAvg =
          (holding.qty * holding.avg + quantity * orderPrice) / totalQty;

        holding.qty = totalQty;
        holding.avg = newAvg;
        holding.price = orderPrice;
        await holding.save();
      } else {
        await HoldingsModel.create({
          user: req.userId,
          name,
          qty: quantity,
          avg: orderPrice,
          price: orderPrice,
          net: "+0.00%",
          day: "+0.00%",
        });
      }

      let position = positions[0];

      if (position) {
        const totalQty = position.qty + quantity;
        const newAvg =
          (position.qty * position.avg + quantity * orderPrice) / totalQty;

        position.qty = totalQty;
        position.avg = newAvg;
        position.price = orderPrice;
        await position.save();
      } else {
        await PositionsModel.create({
          user: req.userId,
          product: "CNC",
          name,
          qty: quantity,
          avg: orderPrice,
          price: orderPrice,
          chg: "+0.00%",
        });
      }

      user.wallet -= cost;
      await user.save();

      await OrdersModel.create({
        user: req.userId,
        name,
        qty: quantity,
        price: orderPrice,
        mode,
      });

      return res.json({ message: "Buy success ✅", wallet: user.wallet });
    }

    // ==================== SELL ====================
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

      const proceeds = quantity * orderPrice;
      user.wallet += proceeds;
      await user.save();

      await OrdersModel.create({
        user: req.userId,
        name,
        qty: quantity,
        price: orderPrice,
        mode,
      });

      return res.json({ message: "Sell success ✅", wallet: user.wallet });
    }

    res.status(400).json({ message: "Invalid order ❌" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ==========================================
// SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});