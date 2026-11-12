// =====================================================================================
// middleware/errors.js  ->  RESPUESTAS DE ERROR comunes a toda la aplicacion.
// =====================================================================================
// Contiene las dos ultimas piezas de la cadena de app.js:
//   - notFound: responde 404 cuando ninguna ruta ni archivo coincide con la URL.
//   - errorHandler: atrapa los errores y responde con un JSON en vez de colgarse.
//
// Codigos de estado HTTP (el numero que acompana a cada respuesta):
//   200 OK            -> todo bien (es el que se usa si no se indica otro).
//   201 Created       -> se ha creado algo nuevo (POST).
//   204 No Content    -> todo bien pero sin body (por ejemplo al borrar con DELETE).
//   400 Bad Request   -> el cliente mando datos incorrectos (JSON roto, campo invalido...).
//   401 Unauthorized  -> hace falta iniciar sesion (ver requireUser.js).
//   404 Not Found     -> no existe esa ruta o ese elemento.
//   409 Conflict      -> choca con algo que ya existe (por ejemplo, un cupon repetido).
//   500 Internal Server Error -> fallo inesperado en NUESTRO codigo.
// Los 4xx son culpa del cliente; los 5xx, del servidor.
// =====================================================================================
//
// Rutas que no existen -> 404 en JSON (se registra despues de todas las rutas).
// No tiene parametro next porque siempre responde: es el final del camino.
function notFound(req, res) {
  // req.method es el metodo (GET, POST...) y req.originalUrl la URL completa pedida.
  // Ejemplo de respuesta: {"error": "Route GET /api/pizzas not found"}
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

// Manejador de errores centralizado (se registra el ultimo en app.js).
// Express sabe que es un manejador de errores porque tiene CUATRO parametros: el primero, err,
// es el error. Por eso "next" debe estar aunque no se use: si lo quitamos, Express lo trataria
// como un middleware normal.
function errorHandler(err, req, res, next) {
  // JSON mal escrito en el body (lo detecta express.json()) -> es culpa del cliente -> 400.
  // "return" corta la funcion aqui para no enviar dos respuestas.
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  // Otros errores del cliente que lanza Express (p. ej. 413 body demasiado grande):
  // si el error ya trae un codigo 4xx, respondemos con ese mismo codigo y su mensaje.
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  // Cualquier otro error es un fallo nuestro: lo mostramos en la terminal para poder
  // depurarlo, pero al cliente solo le decimos "error interno" (500) sin dar detalles.
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

// Exportamos las dos funciones; app.js las importa con const { notFound, errorHandler } = require(...).
module.exports = { notFound, errorHandler };
