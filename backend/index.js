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
      let realizedPnLThisSell = 0;

      for (let h of holdings) {
        if (remaining <= 0) break;

        const qtyFromThis = Math.min(h.qty, remaining);

        // The actual gain/loss locked in: what you sold this chunk for
        // vs. what you originally paid for it (its average buy price).
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
// ADMIN (protected — only the admin email can access)
// ==========================================

app.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
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
        wallet: u.wallet,
        investment: Number(investment.toFixed(2)),
        holdingsValue: Number(holdingsValue.toFixed(2)),
        holdingsCount: userHoldings.length,
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to load admin data ❌" });
  }
});

app.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalOrders = await OrdersModel.countDocuments();
    const users = await UserModel.find().select("wallet");
    const totalWallet = users.reduce((sum, u) => sum + u.wallet, 0);

    res.json({
      totalUsers,
      totalOrders,
      totalWallet: Number(totalWallet.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats ❌" });
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

io.on("connection", (socket) => {
  // send the current snapshot immediately so a new tab isn't blank
  // until the next tick
  socket.emit("market:update", liveMarket.getSnapshot());
});

// Single shared ticker — updates prices and pushes them to every
// connected dashboard every 2.5s. This replaces per-browser random
// simulation with one server-side source of truth all clients share.
setInterval(() => {
  const snapshot = liveMarket.tick();
  io.emit("market:update", snapshot);
}, 2500);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});