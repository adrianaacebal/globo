/*
  Starter — src/middleware/logger.js
  Session 15 Lab · Web Application Programming (G247) · CUNEF EPS
  Week 5 · Session 15 · Practice (AF2) · Pair work

  Paste this file into src/middleware/logger.js (drop the "starter_" prefix).

  Do NOT rename `logger` and do NOT change its signature (req, res, next).
  app.js imports it by this name.
*/

// Application-level middleware. Express calls it for every request with
// three arguments: the request, the response, and next — the function that
// passes control to the next middleware or route.
function logger(req, res, next) {
  // TODO: print EXACTLY ONE line per request in the form "METHOD URL",
  //   e.g. "GET /tasks" or "POST /tasks". A template literal on
  //   req.method and req.url does it.
  // TODO: call next() so the request continues down the pipeline.
  //   (Forget this and every request hangs forever.)
}

module.exports = logger;
