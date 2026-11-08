// Thin router: only maps paths to controller functions.
// Mounted in app.js with app.use("/tasks", tasksRouter), so "/" here is /tasks.
const express = require("express");
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasksController");

const router = express.Router();

router.get("/", listTasks);          // GET    /tasks
router.get("/:id", getTask);         // GET    /tasks/:id
router.post("/", createTask);        // POST   /tasks
router.put("/:id", updateTask);      // PUT    /tasks/:id
router.delete("/:id", deleteTask);   // DELETE /tasks/:id

module.exports = router;
