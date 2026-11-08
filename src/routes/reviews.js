// Router fino: solo une rutas con funciones del controlador.
const express = require("express");
const validateId = require("../middleware/validateId");
const c = require("../controllers/reviewsController");

const router = express.Router();

router.param("id", validateId);

router.get("/", c.listReviews);
router.get("/stats", c.reviewStats); // antes de /:id para que "stats" no se lea como id
router.get("/:id", c.getReview);
router.post("/", c.createReview);
router.put("/:id", c.replaceReview);
router.patch("/:id", c.updateReview);
router.delete("/:id", c.deleteReview);

module.exports = router;
