<<<<<<< HEAD
// Thin router: only maps paths to controller functions.
const express = require("express");
const { listOrders, createOrder } = require("../controllers/ordersController");

const router = express.Router();

router.get("/", listOrders);
router.post("/", createOrder);
=======
// Rutas que usa la web para entrar y pedir (login.html, order.html, burgers.html...)
const express = require("express");
const requireUser = require("../middleware/requireUser");
const { login } = require("../controllers/authController");
const { getMenu } = require("../controllers/dishesController");
const { createOrder, calculateTotal, saveOrder, listOrders } = require("../controllers/ordersController");

const router = express.Router();

router.post("/login", login);
router.get("/menu", getMenu);
router.post("/order", requireUser, createOrder);   // comprueba restaurante + zona
router.post("/order/total", calculateTotal);       // calcula el precio
router.post("/orders", requireUser, saveOrder);    // confirmar pedido (pide la contrasena)
router.get("/orders", requireUser, listOrders);    // historial de pedidos
>>>>>>> 75debf54854a0ad3d4364b0f9d01fe04616281bb

module.exports = router;
