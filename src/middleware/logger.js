// Application-level middleware: prints one "METHOD URL" line per request.
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

module.exports = logger;
