const jwt = require("jsonwebtoken");

// Verifies the JWT sent in the Authorization header and attaches
// the logged-in user's id to req.userId so routes can scope data
// per-user instead of returning everyone's data.
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided ❌" });
    }

    // Accept both "Bearer <token>" and a raw token for backward compatibility
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized ❌" });
  }
};

module.exports = authMiddleware;