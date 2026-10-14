<<<<<<< HEAD
// Builds the Express app. Does not call listen — that lives in server.js.
=======
/*
  Starter — src/app.js
  Session 15 Lab · Web Application Programming (G247) · CUNEF EPS
  Week 5 · Session 15 · Practice (AF2) · Pair work

  Paste this file into src/app.js.

  This file BUILDS and EXPORTS the app. It must NOT call app.listen — that
  is server.js's job (keeping them separate lets later labs test the app
  without opening a port). Do NOT change the export.

  ORDER MATTERS. Middleware runs top to bottom:
    express.json() and the logger must be registered BEFORE the routes,
    and the error handler must be registered AFTER every route.
*/

>>>>>>> 9eda3b9fbd17ea6cb1a28d6bf045855c73526414
const express = require("express");
const logger = require("./middleware/logger");
const tasksRouter = require("./routes/tasks");

const app = express();

<<<<<<< HEAD
// Middleware runs before the routes
app.use(express.json());
app.use(logger);

// Routes
=======
// --- application-level middleware (register BEFORE the routes) ---
app.use(express.json()); // parse JSON bodies into req.body
app.use(logger); // one log line per request

// --- routes ---
>>>>>>> 9eda3b9fbd17ea6cb1a28d6bf045855c73526414
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/echo/:msg", (req, res) => {
  res.json({ echo: req.params.msg });
});

app.use("/tasks", tasksRouter);

<<<<<<< HEAD
app.get("/boom", (req, res) => {
  throw new Error("Boom! Deliberate error");
});

// Centralised error handler — registered last
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
=======
app.get("/boom", (req, res, next) => {
  next(new Error("Boom! Forced failure"));
});

// --- error-handling middleware (register LAST, after every route) ---
// Express recognises an error handler by its FOUR arguments.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
>>>>>>> 9eda3b9fbd17ea6cb1a28d6bf045855c73526414
});

module.exports = app;
