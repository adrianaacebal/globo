// Router fino de /api/coupons: solo une rutas con funciones del controlador.
const express = require("express");
const validateId = require("../middleware/validateId");
const c = require("../controllers/couponsController");

const router = express.Router();

router.param("id", validateId); // /api/coupons/abc -> 400 antes de llegar al controlador

router.get("/", c.listCoupons);
router.get("/stats", c.couponStats); // antes de /:id para que "stats" no se lea como id
router.get("/:id", c.getCoupon);
router.post("/", c.createCoupon);
router.put("/:id", c.replaceCoupon);
router.patch("/:id", c.updateCoupon);
router.delete("/:id", c.deleteCoupon);

module.exports = router;
