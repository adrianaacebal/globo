<<<<<<< HEAD
// Application-level middleware: one log line per request.
// Prints "METHOD URL -> status (ms)" once the response has been sent.
function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms} ms)`);
  });
=======
// Application-level middleware: prints one "METHOD URL" line per request.
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
>>>>>>> 75debf54854a0ad3d4364b0f9d01fe04616281bb
  next();
}

module.exports = logger;
