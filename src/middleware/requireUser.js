// Solo deja pasar si la peticion trae un token valido (Authorization: Bearer <token>).
// Deja el usuario conectado en req.user.
const { userFromRequest } = require("../sessions");

function requireUser(req, res, next) {
  const user = userFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: "You need to log in to order", needLogin: true });
  }
  req.user = user;
  next();
}

module.exports = requireUser;
