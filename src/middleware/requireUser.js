// =====================================================================================
// middleware/requireUser.js  ->  "PORTERO": solo deja pasar a usuarios con sesion iniciada.
// =====================================================================================
// Solo deja pasar si la peticion trae un token valido (Authorization: Bearer <token>).
// Deja el usuario conectado en req.user, para que el controlador sepa quien hace el pedido.
//
// No se usa con app.use (para todas las rutas), sino solo en las rutas que lo necesitan,
// en routes/checkout.js. Por ejemplo:  router.post("/order", requireUser, createOrder);
// Express ejecuta primero requireUser y, si este llama a next(), despues createOrder.
// =====================================================================================
//
// Importamos la funcion que, a partir de la peticion, encuentra al usuario (ver sessions.js).
const { userFromRequest } = require("../sessions");

function requireUser(req, res, next) {
  // Busca el usuario a partir del token de la cabecera (o null si no hay token valido).
  const user = userFromRequest(req);
  // Si no hay usuario: 401 Unauthorized ("tienes que iniciar sesion").
  // needLogin: true le sirve a la web para saber que debe mandar al usuario a login.
  // El return corta aqui: NO se llama a next(), asi que el controlador nunca se ejecuta.
  if (!user) {
    return res.status(401).json({ error: "You need to log in to order", needLogin: true });
  }
  // Hay usuario: lo guardamos en req para que lo usen las siguientes funciones de la ruta.
  req.user = user;
  // Y dejamos pasar la peticion al controlador.
  next();
}

// Se exporta la funcion para usarla en routes/checkout.js.
module.exports = requireUser;
