<<<<<<< HEAD
// Application-level middleware: prints one "METHOD URL" line per request.
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
=======
// Application-level middleware: one log line per request.
function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms} ms)`);
  });
>>>>>>> 9eda3b9fbd17ea6cb1a28d6bf045855c73526414
  next();
}

module.exports = logger;
