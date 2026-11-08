const express = require("express");
const c = require("../controllers/restaurantsController");

const validateId = require("../middleware/validateId");

const router = express.Router();
router.param("id", validateId);

router.post("/", c.createRestaurant);

module.exports = router;

