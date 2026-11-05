// Rutas que no existen -> 404 en JSON (se registra despues de todas las rutas)
function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
}

// Manejador de errores centralizado (se registra el ultimo)
function errorHandler(err, req, res, next) {
  // JSON mal escrito en el body -> es culpa del cliente
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  // Otros errores del cliente que lanza Express (p. ej. 413 body demasiado grande)
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = { notFound, errorHandler };
