// Router fino: solo une rutas con funciones del controlador.
const express = require("express");
<<<<<<< HEAD
const validateId = require("../middleware/validateId");
const c = require("../controllers/restaurantsController");

const router = express.Router();

=======
const c = require("../controllers/restaurantsController");
const validateId = require("../middleware/validateId");

const router = express.Router();
>>>>>>> 810ef171b8cd1b1a7e4a8c2a37b0f44b40b5de1c
router.param("id", validateId);

router.get("/", c.listRestaurants);
router.get("/stats", c.restaurantStats); // antes de /:id para que "stats" no se lea como id
router.get("/:id", c.getRestaurant);
router.post("/", c.createRestaurant);
router.put("/:id", c.replaceRestaurant);
router.patch("/:id", c.updateRestaurant);
router.delete("/:id", c.deleteRestaurant);

module.exports = router;
