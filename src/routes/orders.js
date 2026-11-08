// Router fino de /api/orders: solo une rutas con funciones del controlador.
const express = require("express");
const validateId = require("../middleware/validateId");
const c = require("../controllers/ordersController");

const router = express.Router();

router.param("id", validateId); // /api/orders/abc -> 400 antes de llegar al controlador

router.get("/", c.listOrders);
router.get("/stats", c.orderStats); // antes de /:id para que "stats" no se lea como id
router.get("/:id", c.getOrder);
router.post("/", c.createOrder);
router.put("/:id", c.replaceOrder);
router.patch("/:id", c.updateOrder);
router.delete("/:id", c.deleteOrder);

module.exports = router;
