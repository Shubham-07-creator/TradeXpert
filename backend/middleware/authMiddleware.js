const jwt = require("jsonwebtoken");
const { UserModel } = require("../model/UserModel");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set!");
  process.exit(1);
}

// Verifies the JWT sent in the Authorization header, verifies user is not blocked,
// and attaches req.userId & req.userRole so routes can scope data safely.
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided ❌" });
    }

    // Accept both "Bearer <token>" and a raw token for backward compatibility
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.id;

    // Check if user is blocked by administrator
    const user = await UserModel.findById(decoded.id).select("isBlocked role");
    if (!user) {
      return res.status(401).json({ message: "User account not found ❌" });
    }
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been suspended by an administrator. 🚫",
        isBlocked: true,
      });
    }

    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized ❌" });
  }
};

module.exports = authMiddleware;