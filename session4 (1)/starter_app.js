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
// TODO: app.use(express.json())   -> parse JSON bodies into req.body
// TODO: app.use(logger)           -> one log line per request

// --- routes ---
// TODO: GET /health -> respond with { status: "ok" }
// TODO: GET /echo/:msg -> respond with { echo: <the :msg URL segment> }
//        (read it from req.params.msg)
// TODO: mount the tasks router at "/tasks" with app.use(...)
// TODO: GET /boom -> call next(new Error("...")) to force a failure and
//        prove the error handler below catches it

// --- error-handling middleware (register LAST, after every route) ---
// TODO: app.use((err, req, res, next) => { ... })
//   Express recognises an error handler by its FOUR arguments. Log the
//   error, then respond with err.status || 500 and a JSON body such as
//   { error: err.message }.

module.exports = app;
