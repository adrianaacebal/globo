// Thin router: only maps paths to controller functions.
// Mounted in app.js with app.use("/tasks", tasksRouter), so "/" here is /tasks.
const express = require("express");
const { listTasks, createTask } = require("../controllers/tasksController");

const router = express.Router();

router.get("/", listTasks);    // GET  /tasks
router.post("/", createTask);  // POST /tasks

module.exports = router;
