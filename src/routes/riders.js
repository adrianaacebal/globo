// Router fino de /api/riders: solo une rutas con funciones del controlador.
const express = require("express");
const validateId = require("../middleware/validateId");
const c = require("../controllers/ridersController");

const router = express.Router();

router.param("id", validateId); // /api/riders/abc -> 400 antes de llegar al controlador

router.get("/", c.listRiders);
router.get("/stats", c.riderStats); // antes de /:id para que "stats" no se lea como id
router.get("/:id", c.getRider);
router.post("/", c.createRider);
router.put("/:id", c.replaceRider);
router.patch("/:id", c.updateRider);
router.delete("/:id", c.deleteRider);

module.exports = router;
