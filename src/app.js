// Builds the Express app. Does not call listen — that lives in server.js.
const express = require("express");
const path = require("path");
const logger = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errors");
const restaurantsRouter = require("./routes/restaurants");
const dishesRouter = require("./routes/dishes");
const ordersRouter = require("./routes/orders");

const app = express();

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

// The pages now live in html/, so the home URL sends you to the homepage
app.get("/", (req, res) => res.redirect("/html/index.html"));

// Serves the HTML pages (html/login.html, html/index.html...) from the project folder
app.use(express.static(path.join(__dirname, "..")));

// Anything else -> 404 JSON, then the centralised error handler (registered last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
