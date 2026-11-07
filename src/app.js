/*
  src/app.js — GLOBO Orders API

  This file BUILDS and EXPORTS the app. It must NOT call app.listen — that
  is server.js's job (keeping them separate lets later labs test the app
  without opening a port).

  ORDER MATTERS. Middleware runs top to bottom:
    express.json() and the logger must be registered BEFORE the routes,
    and the error handler must be registered AFTER every route.
*/

const express = require("express");
const logger = require("./middleware/logger");
const ordersRouter = require("./routes/orders");

const app = express();

// --- application-level middleware (register BEFORE the routes) ---
app.use(express.json()); // parse JSON bodies into req.body
app.use(logger); // one log line per request

// --- routes ---
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/echo/:msg", (req, res) => {
  res.json({ echo: req.params.msg });
});

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

module.exports = app;
