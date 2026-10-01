const { UserModel } = require("../model/UserModel");

// Role-based admin check — any user with role "admin" gets through.
// Much safer than hardcoding an email; roles are assigned in the DB.
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only ❌" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
};

module.exports = adminMiddleware;