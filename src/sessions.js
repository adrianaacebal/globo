// =====================================================================================
// sessions.js  ->  SESIONES de usuario (saber quien esta conectado).
// =====================================================================================
// Al hacer login (POST /login, en authController.js) el servidor da un "token" (texto
// aleatorio) que el navegador guarda y manda en cada peticion en la cabecera
// Authorization: Bearer <token>. Asi sabemos quien es, sin pedir la contrasena cada vez.
// Se guardan en memoria: si se reinicia el servidor hay que volver a hacer login.
//
// Lo usan: authController.js (crea la sesion), middleware/requireUser.js (exige estar
// conectado) y checkoutController.js (mira si hay usuario para aplicar su descuento).
// =====================================================================================
const crypto = require("crypto");
const store = require("./data/store");

// Un Map es como un diccionario: guarda pares clave -> valor. Aqui: token -> email del usuario.
// Al estar en una variable (en memoria) y no en un archivo, se pierde al reiniciar el servidor.
const sessions = new Map(); // token -> email

// Crea una sesion para un usuario y devuelve su token (lo envia authController en la respuesta del login).
function newSession(user) {
  // 24 bytes aleatorios en hexadecimal = 48 caracteres: imposible de adivinar.
  const token = crypto.randomBytes(24).toString("hex");
  // Apuntamos que ese token pertenece a ese email.
  sessions.set(token, user.email);
  return token;
}

// Devuelve el usuario conectado, o null si no hay token valido
// Recibe req (la peticion) y mira sus cabeceras (headers).
function userFromRequest(req) {
  // Cabecera Authorization; si no viene, usamos "" para que lo siguiente no falle.
  const header = req.headers.authorization || "";
  // Si empieza por "Bearer ", el token es lo que va detras: slice(7) quita esos 7 caracteres.
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  // Buscamos el token en el Map. Si no existe, get devuelve undefined.
  const email = sessions.get(token);
  // Con el email buscamos el usuario en el store (los usuarios se guardan en data/users.json).
  return email ? store.users.find((u) => u.email === email) : null;
}

// Exportamos las dos funciones; el Map "sessions" queda privado dentro de este modulo.
module.exports = { newSession, userFromRequest };
