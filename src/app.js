// Builds the Express app. Does not call listen — that lives in server.js.
const express = require("express");
const logger = require("./middleware/logger");
const path = require("path");
const tasksRouter = require("./routes/tasks");
const { login, createOrder, calculateTotal, getMenu, saveOrder, listOrders } = require("./controllers/tasksController");

const app = express();

// Middleware runs before the routes
app.use(express.json());
app.use(logger);

// La carpeta data/ (usuarios y contrasenas) no se sirve al navegador
app.use("/data", (req, res) => res.status(404).end());

// Serves the HTML pages (login.html, index.html...) from the project folder
app.use(express.static(path.join(__dirname, "..")));

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/echo/:msg", (req, res) => {
  res.json({ echo: req.params.msg });
});

app.use("/tasks", tasksRouter);

app.post("/login", login);

app.post("/order", createOrder);

app.post("/order/total", calculateTotal);

app.get("/menu", getMenu);

app.post("/orders", saveOrder);   // confirmar pedido (pide la contrasena)

app.get("/orders", listOrders);    // historial de pedidos

app.get("/boom", (req, res) => {
  throw new Error("Boom! Deliberate error");
});

// Centralised error handler — registered last
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

module.exports = app;
