import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "dev_secret_change_me";

export function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }
  try {
    req.user = jwt.verify(h.slice(7), secret);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalido" });
  }
}
