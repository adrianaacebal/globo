// Application-level middleware: one log line per request.
// Prints "METHOD URL -> status (ms)" once the response has been sent.
function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms} ms)`);
  });
  next();
}

module.exports = logger;
