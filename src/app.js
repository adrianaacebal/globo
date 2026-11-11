// Construye la app de Express. No llama a listen: eso esta en server.js (asi los tests usan la app sin abrir un puerto).
const express = require("express");
const path = require("path");
const logger = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errors");
const restaurantsRouter = require("./routes/restaurants");
const dishesRouter = require("./routes/dishes");
const ridersRouter = require("./routes/riders");
const couponsRouter = require("./routes/coupons");
const ordersRouter = require("./routes/orders");
const reviewsRouter = require("./routes/reviews");
<<<<<<< HEAD
=======
const complaintsRouter = require("./routes/complaints");
const messagesRouter = require("./routes/messages");
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
const checkoutRouter = require("./routes/checkout");

const app = express();

// Middleware: se ejecuta antes que las rutas (convierte el body JSON y escribe una linea por peticion)
app.use(express.json());
app.use((req, res, next) => {
  // Express 5 deja req.body en undefined si no llega body: asi los controladores siempre tienen un objeto
  if (req.body === undefined) req.body = {};
  next();
});
app.use(logger);

// API: cada recurso bajo /api/<recurso>, con su router, controlador y validator
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
<<<<<<< HEAD
app.use("/api/restaurants", restaurantsRouter); // recurso principal (filtros + /stats)
=======
app.use("/api/restaurants", restaurantsRouter);
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
app.use("/api/dishes", dishesRouter);
app.use("/api/riders", ridersRouter);
app.use("/api/coupons", couponsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/reviews", reviewsRouter);
<<<<<<< HEAD
=======
app.use("/api/complaints", complaintsRouter);
app.use("/api/messages", messagesRouter);
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c

// Flujo de la web: /login, /menu, /order, /order/total y /orders (historial del usuario)
app.use("/", checkoutRouter);

// La web (public/) la sirve el mismo servidor: http://localhost:3000/restaurants.html
// Va DESPUES de las rutas del API, para que /api/... nunca se confunda con un archivo,
// y solo sirve public/: el codigo (src/) y los datos (data/) no se pueden descargar.
app.use(express.static(path.join(__dirname, "..", "public")));

// Cualquier otra ruta -> 404 en JSON, y despues el manejador de errores (registrado el ULTIMO)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
