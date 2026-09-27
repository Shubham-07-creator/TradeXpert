const { UserModel } = require("../model/UserModel");

// Only this exact email is allowed through — everyone else, even a
// valid logged-in user, gets 403. Override via ADMIN_EMAIL env var if
// needed without changing code.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "shubhamkumar979883@gmail.com";

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user || user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: "Admin access only ❌" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
};

module.exports = adminMiddleware;