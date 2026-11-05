// Router fino: solo une rutas con funciones del controlador.
const express = require("express");
const validateId = require("../middleware/validateId");
const c = require("../controllers/dishesController");

const router = express.Router();

router.param("id", validateId);

router.get("/", c.listDishes);
router.get("/stats", c.dishStats); // antes de /:id para que "stats" no se lea como id
router.get("/:id", c.getDish);
router.post("/", c.createDish);
router.put("/:id", c.replaceDish);
router.patch("/:id", c.updateDish);
router.delete("/:id", c.deleteDish);

module.exports = router;
