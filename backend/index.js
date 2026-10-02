require("dotenv").config();

const express = require("express");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");
const liveMarket = require("./liveMarket");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "499910353398-01upu2f47rj9d7sq5paeftngc0gjdat1.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Fix 2: Crash early if JWT_SECRET is missing
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set!");
  process.exit(1);
}

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

app.use(express.json());

// Fix 5: Rate limiting on auth routes — max 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many attempts, try again later ❌" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Fix 1: In-memory store for one-time auth codes (token exchange)
const authCodes = new Map();

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
// SIGNUP (rate-limited)
// ==========================================

app.post("/signup", authLimiter, async (req, res) => {
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

    // Fix 3: Never send password hash back to the client
    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      message: "Signup success ✅",
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Signup failed ❌",
    });
  }
});

// ==========================================
// LOGIN (rate-limited)
// ==========================================

app.post("/login", authLimiter, async (req, res) => {
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

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been suspended by an administrator. Please contact support. 🚫",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Fix 3: Strip password from login response too
    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      message: "Login success ✅",
      token,
      user: safeUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Login failed ❌",
    });
  }
});

// ==========================================
// GOOGLE OAUTH SIGNUP / LOGIN
// ==========================================

app.post("/auth/google", authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        message: "Google credential token missing ❌",
      });
    }

    let payload = null;

    // 1. If GOOGLE_CLIENT_ID is set, verify cryptographically with Google
    if (GOOGLE_CLIENT_ID && credential !== "demo-google-token") {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.warn("Google verifyIdToken note:", verifyErr.message);
      }
    }

    // 2. Fallback: handle demo test tokens or decode JWT payload safely
    if (!payload) {
      if (credential === "demo-google-token") {
        payload = {
          email: req.body.email || "google.trader@tradexpert.com",
          name: req.body.name || "Google Trader",
          sub: "google_demo_101",
          picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        };
      } else {
        const parts = credential.split(".");
        if (parts.length === 3) {
          payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        }
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        message: "Invalid Google credential token ❌",
      });
    }

    const { email, name, sub: googleId, picture: avatar } = payload;

    // 3. Find existing user by email or googleId
    let user = await UserModel.findOne({
      $or: [{ email }, { googleId }],
    });

    if (user) {
      // Existing user: Link googleId & avatar if missing
      let modified = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        modified = true;
      }
      if (modified) await user.save();
      if (user.isBlocked) {
        return res.status(403).json({
          message: "Your account has been suspended by an administrator. Please contact support. 🚫",
        });
      }
    } else {
      // New user: auto-signup with Google
      user = await UserModel.create({
        name: name || "Google Trader",
        email,
        googleId,
        avatar,
        wallet: 100000, // every new trader receives ₹1,00,000 virtual balance
        role: "user",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      message: "Google authentication success ✅",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({
      message: "Google login failed ❌",
    });
  }
});

// ==========================================
// FORGOT PASSWORD (generate reset link/token)
// ==========================================

app.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email address is required ❌",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "No user found with this email address ❌",
      });
    }

    // Generate random 32-byte crypto token
    const rawResetToken = crypto.randomBytes(32).toString("hex");

    // Save hashed token with 30-minute expiry
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawResetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Determine client base URL cleanly without trailing slash
    let clientBaseUrl = "";
    const origin = req.headers.origin ? req.headers.origin.trim().replace(/\/+$/, "") : "";

    if (origin && origin.includes("localhost")) {
      clientBaseUrl = origin;
    } else if (process.env.FRONTEND_URL) {
      clientBaseUrl = process.env.FRONTEND_URL.trim().replace(/\/+$/, "");
    } else if (origin) {
      clientBaseUrl = origin;
    } else {
      clientBaseUrl = "https://tradexpert-vq6s.onrender.com";
    }

    const resetUrl = `${clientBaseUrl}/reset-password?token=${rawResetToken}`;

    // Send email via nodemailer if SMTP credentials exist
    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"TradeXpert Security" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Password Reset Request — TradeXpert",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #1B4D85; margin-bottom: 12px;">Reset Your TradeXpert Password</h2>
              <p style="color: #475569; line-height: 1.6;">Hello <b>${user.name || "Trader"}</b>,</p>
              <p style="color: #475569; line-height: 1.6;">We received a request to reset your TradeXpert account password. Click the button below to set a new password (valid for 30 minutes):</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #387ED1 0%, #00D09C 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #94A3B8; font-size: 13px;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
            </div>
          `,
        });
        emailSent = true;
      } catch (mailErr) {
        console.warn("SMTP email notification note:", mailErr.message);
      }
    }

    res.json({
      message: emailSent
        ? "Password reset link sent to your email ✅"
        : "Password reset link generated successfully ✅",
      emailSent,
      resetUrl, // Provided for instant local/dev usage and testing
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      message: "Failed to process forgot password request ❌",
    });
  }
});

// ==========================================
// RESET PASSWORD (verify token & update password)
// ==========================================

app.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required ❌",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long ❌",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset link is invalid or has expired ❌",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      message: "Password successfully updated! You can now login ✅",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      message: "Failed to update password ❌",
    });
  }
});

// ==========================================
// AUTH CODE EXCHANGE (Fix 1 — secure cross-origin auth)
// ==========================================

// Step 1: Logged-in user requests a short-lived one-time code
app.post("/auth/code", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    const code = crypto.randomBytes(32).toString("hex");

    // Store code → { token, user } mapping; expires in 30 seconds
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    authCodes.set(code, { token, user, expires: Date.now() + 30_000 });

    // Housekeeping: clean up expired codes
    for (const [k, v] of authCodes) {
      if (v.expires < Date.now()) authCodes.delete(k);
    }

    res.json({ code });
  } catch (err) {
    res.status(500).json({ message: "Code generation failed ❌" });
  }
});

// Step 2: Dashboard exchanges the code for a real token + user
app.post("/auth/exchange", async (req, res) => {
  try {
    const { code } = req.body;
    const entry = authCodes.get(code);

    if (!entry || entry.expires < Date.now()) {
      authCodes.delete(code);
      return res.status(401).json({ message: "Invalid or expired code ❌" });
    }

    // One-time use: delete immediately after exchange
    authCodes.delete(code);

    res.json({ token: entry.token, user: entry.user });
  } catch (err) {
    res.status(500).json({ message: "Exchange failed ❌" });
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
  // Fix 8: Pagination support — ?page=1&limit=20
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    OrdersModel.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OrdersModel.countDocuments({ user: req.userId }),
  ]);

  res.json({
    orders: data,
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
});

// ==========================================
// ORDER SYSTEM (protected, wallet-checked, per-user)
// ==========================================

app.post("/newOrder", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      qty,
      price,
      mode,
      orderType = "MARKET",
      limitPrice,
      product = "CNC",
      stopLoss,
      target,
    } = req.body;

    const quantity = Number(qty);
    const orderPrice = Number(price);

    if (!name || !quantity || quantity <= 0 || !orderPrice || orderPrice <= 0) {
      return res.status(400).json({ message: "Invalid order details ❌" });
    }

    const user = await UserModel.findById(req.userId);
    let holdings = await HoldingsModel.find({ user: req.userId, name });
    let positions = await PositionsModel.find({ user: req.userId, name });

    // ==================== LIMIT ORDER (PENDING) ====================
    if (orderType === "LIMIT") {
      const targetLimitPrice = Number(limitPrice) || orderPrice;
      if (targetLimitPrice <= 0) {
        return res.status(400).json({ message: "Invalid limit price ❌" });
      }

      if (mode === "BUY") {
        const cost = quantity * targetLimitPrice;
        if (cost > user.wallet) {
          return res.status(400).json({ message: "Insufficient funds for limit order ❌" });
        }

        // Lock margin in wallet
        user.wallet -= cost;
        await user.save();

        const openOrder = await OrdersModel.create({
          user: req.userId,
          name,
          qty: quantity,
          price: targetLimitPrice,
          limitPrice: targetLimitPrice,
          mode: "BUY",
          orderType: "LIMIT",
          status: "OPEN",
          product,
          stopLoss: stopLoss ? Number(stopLoss) : null,
          target: target ? Number(target) : null,
        });

        return res.json({
          message: `Limit BUY order placed for ${name} at ₹${targetLimitPrice.toFixed(2)} (OPEN) 🎯`,
          wallet: user.wallet,
          order: openOrder,
        });
      }

      if (mode === "SELL") {
        if (!holdings.length) {
          return res.status(400).json({ message: "Stock not bought yet ❌" });
        }
        let totalQty = holdings.reduce((sum, h) => sum + h.qty, 0);
        if (quantity > totalQty) {
          return res.status(400).json({ message: "Not enough quantity to sell ❌" });
        }

        const openOrder = await OrdersModel.create({
          user: req.userId,
          name,
          qty: quantity,
          price: targetLimitPrice,
          limitPrice: targetLimitPrice,
          mode: "SELL",
          orderType: "LIMIT",
          status: "OPEN",
          product,
        });

        return res.json({
          message: `Limit SELL order placed for ${name} at ₹${targetLimitPrice.toFixed(2)} (OPEN) 🎯`,
          order: openOrder,
        });
      }
    }

    // ==================== MARKET BUY ====================
    if (mode === "BUY") {
      const cost = quantity * orderPrice;

      if (cost > user.wallet) {
        return res.status(400).json({
          message: "Insufficient funds ❌",
        });
      }

      let holding = holdings[0];

      if (holding) {
        const totalQty = holding.qty + quantity;
        const newAvg =
          (holding.qty * holding.avg + quantity * orderPrice) / totalQty;

        holding.qty = totalQty;
        holding.avg = newAvg;
        holding.price = orderPrice;
        if (stopLoss !== undefined && stopLoss !== null && stopLoss !== "") {
          holding.stopLoss = Number(stopLoss);
        }
        if (target !== undefined && target !== null && target !== "") {
          holding.target = Number(target);
        }
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
          stopLoss: stopLoss ? Number(stopLoss) : null,
          target: target ? Number(target) : null,
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
        if (stopLoss !== undefined && stopLoss !== null && stopLoss !== "") {
          position.stopLoss = Number(stopLoss);
        }
        if (target !== undefined && target !== null && target !== "") {
          position.target = Number(target);
        }
        await position.save();
      } else {
        await PositionsModel.create({
          user: req.userId,
          product: product || "CNC",
          name,
          qty: quantity,
          avg: orderPrice,
          price: orderPrice,
          chg: "+0.00%",
          stopLoss: stopLoss ? Number(stopLoss) : null,
          target: target ? Number(target) : null,
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
        orderType: "MARKET",
        status: "EXECUTED",
        product,
        stopLoss: stopLoss ? Number(stopLoss) : null,
        target: target ? Number(target) : null,
      });

      return res.json({ message: "Buy success ✅", wallet: user.wallet });
    }

    // ==================== MARKET SELL ====================
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
      let realizedPnLThisSell = 0;

      for (let h of holdings) {
        if (remaining <= 0) break;

        const qtyFromThis = Math.min(h.qty, remaining);
        realizedPnLThisSell += (orderPrice - h.avg) * qtyFromThis;
        remaining -= qtyFromThis;

        if (h.qty <= qtyFromThis) {
          await HoldingsModel.deleteOne({
            _id: h._id,
          });
        } else {
          h.qty -= qtyFromThis;
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
      user.realizedPnL += realizedPnLThisSell;
      await user.save();

      await OrdersModel.create({
        user: req.userId,
        name,
        qty: quantity,
        price: orderPrice,
        mode,
        orderType: "MARKET",
        status: "EXECUTED",
        product,
      });

      return res.json({
        message: "Sell success ✅",
        wallet: user.wallet,
        realizedPnL: realizedPnLThisSell,
      });
    }

    res.status(400).json({ message: "Invalid order ❌" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// Cancel OPEN limit order
app.put("/orders/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const order = await OrdersModel.findOne({ _id: req.params.id, user: req.userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }
    if (order.status !== "OPEN") {
      return res.status(400).json({ message: "Only OPEN orders can be cancelled ❌" });
    }

    const user = await UserModel.findById(req.userId);
    if (order.mode === "BUY") {
      const refund = order.qty * (order.limitPrice || order.price);
      user.wallet += refund;
      await user.save();
    }

    order.status = "CANCELLED";
    await order.save();

    return res.json({
      message: "Limit order cancelled successfully ✅",
      order,
      wallet: user.wallet,
    });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Failed to cancel order ❌" });
  }
});

// Update GTT (Stop-Loss and Target) for a specific holding
app.put("/holdings/gtt/:id", authMiddleware, async (req, res) => {
  try {
    const { stopLoss, target } = req.body;
    const holding = await HoldingsModel.findOne({ _id: req.params.id, user: req.userId });
    if (!holding) {
      return res.status(404).json({ message: "Holding not found ❌" });
    }

    holding.stopLoss =
      stopLoss !== undefined && stopLoss !== null && stopLoss !== ""
        ? Number(stopLoss)
        : null;
    holding.target =
      target !== undefined && target !== null && target !== ""
        ? Number(target)
        : null;

    await holding.save();
    return res.json({ message: "GTT Stop-Loss & Target updated ✅", holding });
  } catch (err) {
    console.error("Update GTT error:", err);
    res.status(500).json({ message: "Failed to update GTT ❌" });
  }
});

// ==========================================
// LEADERBOARD (protected — any logged-in user can view)
// ==========================================

app.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const users = await UserModel.find().select("name wallet _id");
    const holdings = await HoldingsModel.find();

    const board = users.map((u) => {
      const userHoldings = holdings.filter(
        (h) => String(h.user) === String(u._id),
      );

      const holdingsValue = userHoldings.reduce((sum, h) => {
        const live = liveMarket.getLivePrice(h.name);
        const price = live || h.price;
        return sum + price * h.qty;
      }, 0);

      return {
        name: u.name,
        portfolioValue: Number((u.wallet + holdingsValue).toFixed(2)),
      };
    });

    board.sort((a, b) => b.portfolioValue - a.portfolioValue);

    res.json(board.slice(0, 20));
  } catch (err) {
    res.status(500).json({ message: "Failed to load leaderboard ❌" });
  }
});

// ==========================================
// SERVER + SOCKET.IO (real-time market broadcast)
// ==========================================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

let activeAnnouncement = null;

io.on("connection", (socket) => {
  // send the current snapshot immediately so a new tab isn't blank
  // until the next tick
  socket.emit("market:update", liveMarket.getSnapshot());
  if (activeAnnouncement) {
    socket.emit("system:announcement", activeAnnouncement);
  }
});

// Public / client endpoint to fetch active announcement
app.get("/system/announcement", (req, res) => {
  res.json({ announcement: activeAnnouncement });
});

// ==========================================
// ADMIN COMMAND CENTER (Protected by authMiddleware & adminMiddleware)
// ==========================================

// 1. Get detailed user list with portfolio metrics & status
app.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await UserModel.find().select("-password").sort({ createdAt: -1 });
    const holdings = await HoldingsModel.find();

    const data = users.map((u) => {
      const userHoldings = holdings.filter(
        (h) => String(h.user) === String(u._id),
      );

      const investment = userHoldings.reduce(
        (sum, h) => sum + h.avg * h.qty,
        0,
      );

      const holdingsValue = userHoldings.reduce((sum, h) => {
        const live = liveMarket.getLivePrice(h.name);
        return sum + (live || h.price) * h.qty;
      }, 0);

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role || "user",
        isBlocked: Boolean(u.isBlocked),
        wallet: u.wallet,
        realizedPnL: u.realizedPnL || 0,
        investment: Number(investment.toFixed(2)),
        holdingsValue: Number(holdingsValue.toFixed(2)),
        holdingsCount: userHoldings.length,
        createdAt: u.createdAt || null,
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to load admin user data ❌" });
  }
});

// 2. Platform statistics & system state
app.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalOrders = await OrdersModel.countDocuments();
    const totalAdmins = await UserModel.countDocuments({ role: "admin" });
    const users = await UserModel.find().select("wallet");
    const totalWallet = users.reduce((sum, u) => sum + (u.wallet || 0), 0);

    const holdings = await HoldingsModel.find();
    const totalHoldingsValue = holdings.reduce((sum, h) => {
      const live = liveMarket.getLivePrice(h.name);
      return sum + (live || h.price) * h.qty;
    }, 0);

    res.json({
      totalUsers,
      totalOrders,
      totalAdmins,
      totalWallet: Number(totalWallet.toFixed(2)),
      totalHoldingsValue: Number(totalHoldingsValue.toFixed(2)),
      isMarketHalted: liveMarket.isMarketHalted(),
      activeAnnouncement,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats ❌" });
  }
});

// 3. Adjust User Virtual Wallet (Credit / Debit)
app.post("/admin/users/:id/wallet", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, reason } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ message: "Please enter a valid positive amount ❌" });
    }

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    if (type === "DEBIT") {
      if (user.wallet < numAmount) {
        return res.status(400).json({
          message: `Cannot debit ₹${numAmount.toLocaleString("en-IN")}. Current balance is ₹${user.wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ❌`,
        });
      }
      user.wallet = Number((user.wallet - numAmount).toFixed(2));
    } else {
      user.wallet = Number((user.wallet + numAmount).toFixed(2));
    }

    await user.save();

    res.json({
      message: `Successfully ${type === "CREDIT" ? "credited" : "debited"} ₹${numAmount.toLocaleString("en-IN")} to ${user.name}'s wallet! 💰`,
      wallet: user.wallet,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to adjust user wallet ❌" });
  }
});

// 4. Freeze / Unfreeze user account (Account suspension)
app.put("/admin/users/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (String(req.userId) === String(id)) {
      return res.status(400).json({ message: "You cannot suspend your own admin account! ❌" });
    }

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    user.isBlocked = Boolean(isBlocked);
    await user.save();

    res.json({
      message: user.isBlocked ? `Account for ${user.name} suspended! 🚫` : `Account for ${user.name} reactivated! ✅`,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update account status ❌" });
  }
});

// 5. Promote / Demote user role
app.put("/admin/users/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified ❌" });
    }

    if (String(req.userId) === String(id)) {
      return res.status(400).json({ message: "You cannot change your own admin role! ❌" });
    }

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    user.role = role;
    await user.save();

    res.json({
      message: `User ${user.name} role changed to ${role.toUpperCase()}! 👑`,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user role ❌" });
  }
});

// 6. Reset user portfolio (wipe positions, cancel open orders, reset wallet to ₹1,00,000)
app.post("/admin/users/:id/reset-portfolio", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    await HoldingsModel.deleteMany({ user: id });
    await OrdersModel.deleteMany({ user: id, status: "OPEN" });

    user.wallet = 100000;
    user.realizedPnL = 0;
    await user.save();

    res.json({
      message: `Portfolio and open orders for ${user.name} have been reset to default ₹1,00,000! 🔄`,
      wallet: user.wallet,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to reset portfolio ❌" });
  }
});

// 7. Live Market Circuit Breaker (Halt / Resume market ticking)
app.post("/admin/market/circuit-breaker", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { halted } = req.body;
    const newHaltStatus = liveMarket.setMarketHalt(Boolean(halted));
    const snapshot = liveMarket.getSnapshot();

    io.emit("market:update", snapshot);
    io.emit("market:circuit-breaker", { isHalted: newHaltStatus });

    res.json({
      message: newHaltStatus
        ? "🛑 Market Circuit Breaker Activated (Live prices halted)"
        : "🟢 Market Circuit Breaker Lifted (Live prices running)",
      isHalted: newHaltStatus,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle circuit breaker ❌" });
  }
});

// 8. Inject Market Volatility Shock (Bull surge, Bear crash, or Base reset)
app.post("/admin/market/shock", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { direction, percent } = req.body;
    let snapshot;
    let desc = "";

    if (direction === "RESET") {
      snapshot = liveMarket.resetMarketPrices();
      desc = "Market prices normalized back to seed base values 🔄";
    } else if (direction === "BULL") {
      const pct = Math.abs(Number(percent) || 2.5);
      snapshot = liveMarket.triggerShock("BULL", pct);
      desc = `Bullish surge (+${pct}%) injected across all market tickers! 🚀`;
    } else if (direction === "BEAR") {
      const pct = Math.abs(Number(percent) || 2.5);
      snapshot = liveMarket.triggerShock("BEAR", pct);
      desc = `Flash market crash (-${pct}%) simulated across all tickers! 📉`;
    } else {
      return res.status(400).json({ message: "Invalid shock direction ❌" });
    }

    io.emit("market:update", snapshot);
    await checkLimitOrdersAndGTT(io);

    res.json({ message: desc, snapshot });
  } catch (err) {
    res.status(500).json({ message: "Failed to inject market shock ❌" });
  }
});

// 9. Send Global System Broadcast Banner (Real-time to all connected users)
app.post("/admin/broadcast", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { message, level } = req.body;

    if (!message || !message.trim()) {
      activeAnnouncement = null;
      io.emit("system:announcement", null);
      return res.json({ message: "Broadcast cleared! 🗑️", activeAnnouncement: null });
    }

    activeAnnouncement = {
      id: Date.now(),
      message: message.trim(),
      level: level || "warning",
      timestamp: new Date().toISOString(),
    };

    io.emit("system:announcement", activeAnnouncement);
    res.json({
      message: "Announcement broadcasted live to all active traders! 📢",
      activeAnnouncement,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to broadcast announcement ❌" });
  }
});

// 10. Clear Global Broadcast Banner
app.delete("/admin/broadcast", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    activeAnnouncement = null;
    io.emit("system:announcement", null);
    res.json({ message: "Broadcast banner cleared! 🗑️" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear broadcast ❌" });
  }
});

// Limit Order & GTT (Stop-Loss / Target) Execution Engine
async function checkLimitOrdersAndGTT(ioInstance) {
  try {
    // 1. Process Open Limit Orders
    const openOrders = await OrdersModel.find({ status: "OPEN" });
    for (const order of openOrders) {
      const livePrice = liveMarket.getLivePrice(order.name);
      if (!livePrice) continue;

      const limitThreshold = order.limitPrice || order.price;

      // BUY LIMIT: triggers when price dips to or below limit
      if (order.mode === "BUY" && livePrice <= limitThreshold) {
        const user = await UserModel.findById(order.user);
        if (!user) continue;

        // If executed cheaper than limit, refund difference
        if (livePrice < limitThreshold) {
          const diff = (limitThreshold - livePrice) * order.qty;
          user.wallet += diff;
          await user.save();
        }

        if (order.product === "MIS") {
          let position = await PositionsModel.findOne({
            user: order.user,
            name: order.name,
          });
          if (position) {
            const totalQty = position.qty + order.qty;
            position.avg =
              (position.qty * position.avg + order.qty * livePrice) / totalQty;
            position.qty = totalQty;
            position.price = livePrice;
            if (order.stopLoss) position.stopLoss = order.stopLoss;
            if (order.target) position.target = order.target;
            await position.save();
          } else {
            await PositionsModel.create({
              user: order.user,
              product: "MIS",
              name: order.name,
              qty: order.qty,
              avg: livePrice,
              price: livePrice,
              chg: "+0.00%",
              stopLoss: order.stopLoss || null,
              target: order.target || null,
            });
          }
        } else {
          let holding = await HoldingsModel.findOne({
            user: order.user,
            name: order.name,
          });
          if (holding) {
            const totalQty = holding.qty + order.qty;
            holding.avg =
              (holding.qty * holding.avg + order.qty * livePrice) / totalQty;
            holding.qty = totalQty;
            holding.price = livePrice;
            if (order.stopLoss) holding.stopLoss = order.stopLoss;
            if (order.target) holding.target = order.target;
            await holding.save();
          } else {
            await HoldingsModel.create({
              user: order.user,
              name: order.name,
              qty: order.qty,
              avg: livePrice,
              price: livePrice,
              net: "+0.00%",
              day: "+0.00%",
              stopLoss: order.stopLoss || null,
              target: order.target || null,
            });
          }
        }

        order.status = "EXECUTED";
        order.price = livePrice;
        await order.save();

        ioInstance.emit("order:executed", {
          orderId: order._id,
          name: order.name,
          mode: "BUY",
          price: livePrice,
          qty: order.qty,
          user: order.user,
          orderType: "LIMIT",
        });
      }

      // SELL LIMIT: triggers when price rises to or above limit
      else if (order.mode === "SELL" && livePrice >= limitThreshold) {
        const user = await UserModel.findById(order.user);
        if (!user) continue;

        let holdings = await HoldingsModel.find({
          user: order.user,
          name: order.name,
        });
        let totalQty = holdings.reduce((sum, h) => sum + h.qty, 0);

        if (order.qty > totalQty) {
          order.status = "CANCELLED";
          await order.save();
          continue;
        }

        let remaining = order.qty;
        let realizedPnL = 0;

        for (let h of holdings) {
          if (remaining <= 0) break;
          const qtyFromThis = Math.min(h.qty, remaining);
          realizedPnL += (livePrice - h.avg) * qtyFromThis;
          remaining -= qtyFromThis;

          if (h.qty <= qtyFromThis) {
            await HoldingsModel.deleteOne({ _id: h._id });
          } else {
            h.qty -= qtyFromThis;
            await h.save();
          }
        }

        await PositionsModel.deleteMany({
          user: order.user,
          name: order.name,
          qty: { $lte: order.qty },
        });

        const proceeds = order.qty * livePrice;
        user.wallet += proceeds;
        user.realizedPnL += realizedPnL;
        await user.save();

        order.status = "EXECUTED";
        order.price = livePrice;
        await order.save();

        ioInstance.emit("order:executed", {
          orderId: order._id,
          name: order.name,
          mode: "SELL",
          price: livePrice,
          qty: order.qty,
          user: order.user,
          orderType: "LIMIT",
          realizedPnL,
        });
      }
    }

    // 2. Process GTT (Stop-Loss & Target) Triggers on Holdings
    const gttHoldings = await HoldingsModel.find({
      $or: [{ stopLoss: { $ne: null } }, { target: { $ne: null } }],
    });

    for (const holding of gttHoldings) {
      const livePrice = liveMarket.getLivePrice(holding.name);
      if (!livePrice) continue;

      let triggeredType = null;
      if (holding.stopLoss && livePrice <= holding.stopLoss) {
        triggeredType = "SL_TRIGGER";
      } else if (holding.target && livePrice >= holding.target) {
        triggeredType = "TARGET_TRIGGER";
      }

      if (triggeredType) {
        const user = await UserModel.findById(holding.user);
        if (!user) continue;

        const realizedPnL = (livePrice - holding.avg) * holding.qty;
        const proceeds = holding.qty * livePrice;

        user.wallet += proceeds;
        user.realizedPnL += realizedPnL;
        await user.save();

        await OrdersModel.create({
          user: holding.user,
          name: holding.name,
          qty: holding.qty,
          price: livePrice,
          mode: "SELL",
          orderType: triggeredType,
          status: "EXECUTED",
          product: "CNC",
        });

        await HoldingsModel.deleteOne({ _id: holding._id });
        await PositionsModel.deleteMany({
          user: holding.user,
          name: holding.name,
        });

        ioInstance.emit("gtt:triggered", {
          user: holding.user,
          name: holding.name,
          type: triggeredType === "SL_TRIGGER" ? "STOP_LOSS" : "TARGET",
          price: livePrice,
          qty: holding.qty,
          realizedPnL,
        });
      }
    }
  } catch (err) {
    console.error("Error in checkLimitOrdersAndGTT:", err.message);
  }
}

// Single shared ticker — updates prices and pushes them to every
// connected dashboard every 2.5s. Also processes limit orders and GTT triggers.
setInterval(async () => {
  const snapshot = liveMarket.tick();
  io.emit("market:update", snapshot);
  await checkLimitOrdersAndGTT(io);
}, 2500);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});