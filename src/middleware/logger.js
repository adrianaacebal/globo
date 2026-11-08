// Application-level middleware: prints exactly one "METHOD URL" line per
// request (e.g. "GET /tasks"), then calls next() so the request continues
// down the pipeline. Without next() every request would hang forever.
function logger(req, res, next) {
  if (process.env.NODE_ENV !== "test") console.log(`${req.method} ${req.url}`);
  next();
}

module.exports = logger;
