const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [type, token] = auth.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing Bearer token" });
    }

    const secret = process.env.JWT_SECRET;
    const payload = jwt.verify(token, secret);

    req.user = payload; // {sub, email, roles, iat, exp}
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
}

module.exports = { requireAuth };
