// Builds the Express app. Does not call listen — that lives in server.js.
const express = require("express");
const logger = require("./middleware/logger");
const tasksRouter = require("./routes/tasks");

const app = express();

// Middleware runs before the routes
app.use(express.json());
app.use(logger);

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/echo/:msg", (req, res) => {
  res.json({ echo: req.params.msg });
});

app.use("/tasks", tasksRouter);

app.get("/boom", (req, res) => {
  throw new Error("Boom! Deliberate error");
});

// Centralised error handler — registered last
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

module.exports = app;
