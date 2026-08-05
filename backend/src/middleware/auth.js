const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "ethara_super_secret_jwt_key_2026";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No authentication token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Token expired or invalid." });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden. Insufficient permissions for this action." });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
