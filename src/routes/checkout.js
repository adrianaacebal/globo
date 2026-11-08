// Rutas del flujo de la web (login.html, order.html, burgers.html...): entrar, ver la carta y pedir
const express = require("express");
const requireUser = require("../middleware/requireUser");
const { login } = require("../controllers/authController");
const { getMenu } = require("../controllers/dishesController");
const { createOrder, calculateTotal, saveOrder, listOrders } = require("../controllers/checkoutController");

const router = express.Router();

router.post("/login", login);
router.get("/menu", getMenu);
router.post("/order", requireUser, createOrder);   // comprueba restaurante + zona
router.post("/order/total", calculateTotal);       // calcula el precio
router.post("/orders", requireUser, saveOrder);    // confirmar pedido (pide la contrasena)
router.get("/orders", requireUser, listOrders);    // historial de pedidos

module.exports = router;
