<<<<<<< HEAD
/*
  src/app.js — GLOBO Orders API

  This file BUILDS and EXPORTS the app. It must NOT call app.listen — that
  is server.js's job (keeping them separate lets later labs test the app
  without opening a port).

  ORDER MATTERS. Middleware runs top to bottom:
    express.json() and the logger must be registered BEFORE the routes,
    and the error handler must be registered AFTER every route.
*/

=======
// Builds the Express app. Does not call listen — that lives in server.js.
>>>>>>> 75debf54854a0ad3d4364b0f9d01fe04616281bb
const express = require("express");
const path = require("path");
const logger = require("./middleware/logger");
<<<<<<< HEAD
=======
const { notFound, errorHandler } = require("./middleware/errors");
const restaurantsRouter = require("./routes/restaurants");
const dishesRouter = require("./routes/dishes");
>>>>>>> 75debf54854a0ad3d4364b0f9d01fe04616281bb
const ordersRouter = require("./routes/orders");

const app = express();

<<<<<<< HEAD
// --- application-level middleware (register BEFORE the routes) ---
app.use(express.json()); // parse JSON bodies into req.body
app.use(logger); // one log line per request

// --- routes ---
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
=======
// Middleware runs before the routes
app.use(express.json());
app.use((req, res, next) => {
  // Express 5 deja req.body en undefined si no llega body: asi los controladores siempre tienen un objeto
  if (req.body === undefined) req.body = {};
  next();
});
app.use(logger);

// API
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/restaurants", restaurantsRouter);
app.use("/dishes", dishesRouter);
app.use("/", ordersRouter); // /login, /menu, /order, /order/total, /orders

// El codigo del servidor y los datos (usuarios y contrasenas) no se sirven al navegador
const PRIVATE = /^\/(src|data|node_modules|postman|package(-lock)?\.json)(\/|$)/i;
app.use((req, res, next) => (PRIVATE.test(req.path) ? notFound(req, res) : next()));
>>>>>>> 75debf54854a0ad3d4364b0f9d01fe04616281bb

// Serves the HTML pages (login.html, index.html...) from the project folder
app.use(express.static(path.join(__dirname, "..")));

<<<<<<< HEAD
app.use("/orders", ordersRouter);

app.get("/boom", (req, res, next) => {
  next(new Error("Boom! Forced failure"));
});

// --- error-handling middleware (register LAST, after every route) ---
// Express recognises an error handler by its FOUR arguments.
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message });
});
=======
// Anything else -> 404 JSON, then the centralised error handler (registered last)
app.use(notFound);
app.use(errorHandler);
>>>>>>> 75debf54854a0ad3d4364b0f9d01fe04616281bb

module.exports = app;
