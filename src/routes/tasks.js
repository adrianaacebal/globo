// Thin router: only maps paths to controller functions.
const express = require("express");
const { listTasks, createTask } = require("../controllers/tasksController");

const router = express.Router();

router.get("/", listTasks);
router.post("/", createTask);

module.exports = router;
