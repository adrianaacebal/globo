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

const express = require("express");
const logger = require("./middleware/logger");
const tasksRouter = require("./routes/tasks");

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

app.use("/tasks", tasksRouter);

app.get("/boom", (req, res, next) => {
  next(new Error("Boom! Forced failure"));
});

// --- error-handling middleware (register LAST, after every route) ---
// Express recognises an error handler by its FOUR arguments.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;
