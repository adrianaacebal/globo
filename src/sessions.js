// Sesiones: al hacer login el servidor da un "token" (texto aleatorio) que el navegador guarda
// y manda en la cabecera Authorization: Bearer <token>. Asi sabemos quien es.
// Se guardan en memoria: si se reinicia el servidor hay que volver a hacer login.
const crypto = require("crypto");
const store = require("./data/store");

const sessions = new Map(); // token -> email

function newSession(user) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, user.email);
  return token;
}

// Devuelve el usuario conectado, o null si no hay token valido
function userFromRequest(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const email = sessions.get(token);
  return email ? store.users.find((u) => u.email === email) : null;
}

module.exports = { newSession, userFromRequest };
