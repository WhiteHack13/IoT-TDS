const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usersRepo = require("./users.repo");

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET missing or too short (min 32 chars).");
  }
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "2h" });
}

async function login(email, password) {
  const user = await usersRepo.findByEmail(email);
  if (!user || !user.isActive) return null;

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return null;

  // Payload mínimo (no metas datos sensibles)
  const token = signToken({
    sub: user.id,
    email: user.email,
    roles: user.roles,
  });

  return { token, user: { id: user.id, email: user.email, roles: user.roles } };
}

module.exports = { login };
