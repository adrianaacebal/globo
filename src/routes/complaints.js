// Router fino: solo une rutas con funciones del controlador.
const express = require("express");
const validateId = require("../middleware/validateId");
const c = require("../controllers/complaintsController");

const router = express.Router();

router.param("id", validateId);

router.get("/", c.listComplaints);
router.get("/stats", c.complaintStats); // antes de /:id para que "stats" no se lea como id
router.get("/:id", c.getComplaint);
router.post("/", c.createComplaint);
router.put("/:id", c.replaceComplaint);
router.patch("/:id", c.updateComplaint);
router.delete("/:id", c.deleteComplaint);

module.exports = router;
