// Router fino: solo une rutas con funciones del controlador.
const express = require("express");
const validateId = require("../middleware/validateId");
const c = require("../controllers/messagesController");

const router = express.Router();

router.param("id", validateId);

router.get("/", c.listMessages);
router.get("/stats", c.messageStats); // antes de /:id para que "stats" no se lea como id
router.get("/:id", c.getMessage);
router.post("/", c.createMessage);
router.put("/:id", c.replaceMessage);
router.patch("/:id", c.updateMessage);
router.delete("/:id", c.deleteMessage);

module.exports = router;
