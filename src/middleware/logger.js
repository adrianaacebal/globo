// =====================================================================================
// middleware/logger.js  ->  REGISTRO (log) de las peticiones en la terminal.
// =====================================================================================
// Middleware a nivel de aplicacion (se registra con app.use(logger) en app.js, antes de
// las rutas): escribe exactamente una linea "METODO URL" por peticion (por ejemplo
// "GET /api/restaurants") y despues llama a next() para que la peticion siga su camino
// por la cadena. Sin next() todas las peticiones se quedarian colgadas para siempre.
// =====================================================================================
//
// Parametros de todo middleware: req (peticion), res (respuesta), next (pasar a la siguiente pieza).
function logger(req, res, next) {
  // process.env.NODE_ENV es una variable de entorno. Jest (los tests) la pone a "test":
  // asi, mientras se ejecutan los tests, no se llena la pantalla de lineas de log.
  if (process.env.NODE_ENV !== "test") console.log(`${req.method} ${req.url}`);
  // Este middleware no responde nada: solo apunta la peticion y la deja continuar.
  next();
}

// Se exporta una sola funcion (no un objeto), por eso en app.js se importa con const logger = require(...).
module.exports = logger;
