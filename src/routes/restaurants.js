// Router fino: solo une rutas con funciones del controlador.
const express = require("express");
const validateId = require("../middleware/validateId");
const c = require("../controllers/restaurantsController");

const router = express.Router();

router.param("id", validateId);

router.get("/", c.listRestaurants);
router.get("/stats", c.restaurantStats); // antes de /:id para que "stats" no se lea como id
router.get("/:id", c.getRestaurant);
router.post("/", c.createRestaurant);
router.put("/:id", c.replaceRestaurant);
router.patch("/:id", c.updateRestaurant);
router.delete("/:id", c.deleteRestaurant);

module.exports = router;
