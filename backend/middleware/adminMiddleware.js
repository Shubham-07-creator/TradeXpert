const { UserModel } = require("../model/UserModel");

// Role-based admin check — any user with role "admin" gets through.
const adminMiddleware = async (req, res, next) => {
  try {
    if (req.userRole) {
      if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Admin access only ❌" });
      }
      return next();
    }

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